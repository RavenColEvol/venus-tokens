import { formatRgb, parse, Rgb } from 'culori';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	CodeAction,
	CodeActionKind,
	Color,
	ColorInformation,
	Command,
	CompletionItem,
	CompletionItemKind,
	createConnection,
	Diagnostic,
	DiagnosticSeverity,
	DidChangeConfigurationNotification,
	DocumentDiagnosticReportKind,
	InitializeParams,
	InitializeResult,
	ProposedFeatures,
	TextDocumentEdit,
	TextDocumentPositionParams,
	TextDocuments,
	TextDocumentSyncKind,
	TextEdit,
	type DocumentDiagnosticReport,
} from 'vscode-languageserver/node';
import {
	categories,
	compareTokenForCategory,
	getAllTokensForValue,
	tokensByCategory,
} from './utils';
import tokens from './variables';

const connection = createConnection(ProposedFeatures.all);

const documents = new TextDocuments(TextDocument);
const diagnosticWeakMap = new WeakMap<TextDocument, Diagnostic[]>();
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

export const CommandIds = {
	ReplaceToken: 'venusTokens.replaceToken',
	ReplaceAllTokens: 'venusTokens.replaceAllTokens',
};

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			completionProvider: {
				triggerCharacters: ['--'],
				resolveProvider: true,
			},
			hoverProvider: true,
			colorProvider: true,
			codeActionProvider: {
				codeActionKinds: [CodeActionKind.QuickFix, CodeActionKind.Source],
			},
			diagnosticProvider: {
				interFileDependencies: false,
				workspaceDiagnostics: false,
			},
			executeCommandProvider: {
				commands: [CommandIds.ReplaceToken],
			},
		},
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true,
			},
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		connection.client.register(
			DidChangeConfigurationNotification.type,
			undefined
		);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders((_event) => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

interface VenusTokensSettings {
	tokenSuggestions: {
		enabled: boolean;
	};
}

const defaultSettings: VenusTokensSettings = {
	tokenSuggestions: { enabled: true },
};
let globalSettings: VenusTokensSettings = defaultSettings;

const documentSettings = new Map<string, Thenable<VenusTokensSettings>>();

connection.onDidChangeConfiguration((change) => {
	if (hasConfigurationCapability) {
		documentSettings.clear();
	} else {
		globalSettings = change.settings.venusTokens || defaultSettings;
	}
	// Refresh the diagnostics since the `maxNumberOfProblems` could have changed.
	// We could optimize things here and re-fetch the setting first can compare it
	// to the existing setting, but this is out of scope for this example.
	connection.languages.diagnostics.refresh();
});

function getDocumentSettings(resource: string): Thenable<VenusTokensSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'venusTokens',
		});
		documentSettings.set(resource, result);
	}
	return result;
}

documents.onDidClose((e) => {
	const document = documents.get(e.document.uri);
	documentSettings.delete(e.document.uri);
	if (document) {
		diagnosticWeakMap.delete(document);
	}
});

connection.languages.diagnostics.on(async (params) => {
	const document = documents.get(params.textDocument.uri);
	if (document !== undefined) {
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: await lintCssFile(document),
		} satisfies DocumentDiagnosticReport;
	} else {
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: [],
		} satisfies DocumentDiagnosticReport;
	}
});

documents.onDidChangeContent((change) => {
	// IMPORTANT
	lintCssFile(change.document);
});

// Feat: Linter Feature
async function lintCssFile(textDocument: TextDocument): Promise<Diagnostic[]> {
	const settings = await getDocumentSettings(textDocument.uri);
	if (!settings.tokenSuggestions.enabled) {
		return [];
	}
	const text = textDocument.getText();
	const cssValueReg = /(?<=:\s)(?!var\()[^;]+/g;
	//TODO: Handle Media Query seperately
	cssValueReg.lastIndex = 0;
	let m: RegExpExecArray | null;

	const diagnostics: Diagnostic[] = [];
	while ((m = cssValueReg.exec(text))) {
		const property = textDocument.getText({
			start: {
				line: textDocument.positionAt(m.index).line,
				character: 0,
			},
			end: {
				line: textDocument.positionAt(m.index).line,
				character: 1e3,
			},
		});
		const value = m[0];
		for (const [category, { properties, tokensRegex }] of Object.entries(
			categories
		)) {
			for (const propertyRegex of properties) {
				if (!propertyRegex.test(property) || !tokensByCategory.has(category)) {
					continue;
				}
				const values = getAllTokensForValue(value, m, tokensRegex);
				let token;
				for (const { value, startIdx, endIdx } of values) {
					if (
						(token = compareTokenForCategory(
							category as keyof typeof categories,
							value
						))
					) {
						const range = {
							start: textDocument.positionAt(startIdx),
							end: textDocument.positionAt(endIdx),
						};
						diagnostics.push({
							severity: DiagnosticSeverity.Information,
							range: range,
							message: `Consider using ${token} instead of ${value}`,
							source: 'Venus Tokens',
							data: {
								token,
								range,
							},
						});
					}
				}
			}
		}
	}
	diagnosticWeakMap.set(textDocument, diagnostics);
	return diagnostics;
}

connection.onDidChangeWatchedFiles((_change) => {
	connection.console.log('We received a file change event');
});

// Feat: Hover Preview Feature
connection.onHover((textDocumentPosition: TextDocumentPositionParams) => {
	// Implement hover functionality here
	const document = documents.get(textDocumentPosition.textDocument.uri);
	if (!document) {
		return {
			contents: [],
		};
	}
	const position = textDocumentPosition.position;
	const currLine = document.getText({
		start: {
			line: position.line,
			character: 0,
		},
		end: {
			line: position.line,
			character: 1e3,
		},
	});
	const token = Object.keys(tokens).find((variable) => {
		const index = currLine.indexOf(variable);
		return index > -1 && index <= position.character;
	});
	if (!token) {
		return {
			contents: [],
		};
	}
	return {
		contents: [
			`**Venus Token** <br /> Value: **${
				tokens[token as keyof typeof tokens]
			}**`,
		],
	};
});

// FEATURE: AUTOCOMPLETE
const completionItems = Object.entries(tokens).map(([key, value]) => {
	const isColor = key.includes('color');
	return {
		label: key,
		kind: isColor ? CompletionItemKind.Color : CompletionItemKind.Text,
		data: value,
	};
});
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		return completionItems;
	}
);

connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
	if (item.kind === CompletionItemKind.Color) {
		item.documentation = `Color: ${item.label}, Value: ${item.data}`;
	} else {
		item.documentation = `Variable: ${item.label}, Value: ${item.data}`;
	}
	return item;
});

// Feat: Color Preview Feature
connection.onDocumentColor((params) => {
	const document = documents.get(params.textDocument.uri);
	if (!document) {
		return [];
	}
	const text = document.getText();
	const variableRegex = /var\((?<varName>--[a-z-0-9]+)/g;
	let match;
	const venusColors: ColorInformation[] = [];
	while ((match = variableRegex.exec(text))) {
		const variable = match.groups?.varName;
		const isColor = variable?.includes('color');
		if (!variable) {
			continue;
		}
		if (!isColor || !(variable in tokens)) {
			continue;
		}
		const colorValue = tokens[variable as keyof typeof tokens];
		const rgbaColor = formatRgb(colorValue);
		if (!rgbaColor) {
			continue;
		}
		const parsedColor = parse(rgbaColor) as Rgb;
		const color: Color = {
			red: parsedColor.r,
			green: parsedColor.g,
			blue: parsedColor.b,
			alpha: parsedColor.alpha || 1,
		};
		venusColors.push({
			range: {
				start: document.positionAt(match.index),
				end: document.positionAt(match.index + match[0].length),
			},
			color,
		});
	}
	return venusColors;
});

connection.onColorPresentation((_params) => {
	return [];
});

// Feat: Quick Fix
connection.onCodeAction((params) => {
	const textDocument = documents.get(params.textDocument.uri);
	if (textDocument === undefined) {
		return undefined;
	}
	const data = params.context.diagnostics.find(
		(v) => v.source === 'Venus Tokens'
	)?.data;
	if (!data) {
		return undefined;
	}
	const quickFix = 'Replace with Venus Token';
	return [
		CodeAction.create(
			quickFix,
			Command.create(quickFix, CommandIds.ReplaceToken, textDocument.uri, data),
			CodeActionKind.QuickFix
		),
	];
});

connection.onExecuteCommand(async (params) => {
	if (params.arguments === undefined) {
		return;
	}

	if (params.command === CommandIds.ReplaceAllTokens) {
		const { uri } = params.arguments[0];
		const textDocument = documents.get(uri);
		if (!textDocument) {
			return;
		}
		const diagnostics = diagnosticWeakMap.get(textDocument);
		if (!diagnostics) {
			return;
		}
		const edits: TextEdit[] = [];
		diagnostics.forEach((diagnostic) => {
			const { range, data } = diagnostic;
			const { token } = data;
			edits.push(TextEdit.replace(range, `var(${token})`));
		});
		connection.workspace
			.applyEdit({
				documentChanges: [
					TextDocumentEdit.create(
						{ uri: textDocument.uri, version: textDocument.version },
						edits
					),
				],
			})
			.then(({ applied }) => {
				if (applied) {
					connection.console.error(`Failed to apply ${params.command}`);
				}
			});
		return;
	}

	if (params.command === CommandIds.ReplaceToken) {
		const textDocument = documents.get(params.arguments[0]);
		const data = params.arguments[1];
		if (textDocument === undefined || !data) {
			return;
		}
		const { range, token } = data;
		connection.workspace.applyEdit({
			documentChanges: [
				TextDocumentEdit.create(
					{ uri: textDocument.uri, version: textDocument.version },
					[TextEdit.replace(range, `var(${token})`)]
				),
			],
		});
	}
});

documents.listen(connection);

connection.listen();
