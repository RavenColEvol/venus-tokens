import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	DocumentDiagnosticReportKind,
	type DocumentDiagnosticReport,
	ColorInformation,
	Color,
} from 'vscode-languageserver/node';
import tokens from './variables';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { formatRgb, parse, Rgb } from 'culori';

const connection = createConnection(ProposedFeatures.all);

const documents = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

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
			diagnosticProvider: {
				interFileDependencies: false,
				workspaceDiagnostics: false,
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
	documentSettings.delete(e.document.uri);
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

// TODO: Linter Feature
async function lintCssFile(
	textDocument: TextDocument
): Promise<Diagnostic[]> {
	const settings = await getDocumentSettings(textDocument.uri);
	if (!settings.tokenSuggestions.enabled) {
		return [];
	}
	// const text = textDocument.getText();
	// const pattern = /\b[A-Z]{2,}\b/g;
	// let m: RegExpExecArray | null;

	const diagnostics: Diagnostic[] = [];
	// while ((m = pattern.exec(text))) {
	// 	const diagnostic: Diagnostic = {
	// 		severity: DiagnosticSeverity.Information,
	// 		range: {
	// 			start: textDocument.positionAt(m.index),
	// 			end: textDocument.positionAt(m.index + m[0].length),
	// 		},
	// 		// use one of the suggestion in the message
	// 		message: `${m[0]} is all uppercase.`,
	// 		source: 'ex',
	// 	};
	// 	diagnostics.push(diagnostic);
	// }
	return diagnostics;
}

connection.onDidChangeWatchedFiles((_change) => {
	connection.console.log('We received a file change event');
});

// TODO: Hover Preview Feature
connection.onHover((textDocumentPosition: TextDocumentPositionParams) => {
	// Implement hover functionality here
	const document = documents.get(textDocumentPosition.textDocument.uri);
	if (!document) {return;}
	const position = textDocumentPosition.position;
	console.log('position', position);
	return {
		contents: {
			kind: 'markdown',
			value: 'Hover content',
		},
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
  if (!document) { return []; }
	const text = document.getText();
	const variableRegex = /var\((?<varName>--[a-z-0-9]+)/g;
	let match;
	const venusColors: ColorInformation[] = [];
	while((match = variableRegex.exec(text))) {
		const variable = match.groups?.varName;
		const isColor = variable?.includes('color');
		if (!variable) { continue; }
		if (!isColor || !(variable in tokens)) { continue; }
		const colorValue = tokens[variable as keyof typeof tokens];
		const rgbaColor = formatRgb(colorValue);
		if (!rgbaColor) { continue; }
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
	// No need for now since we are not allowing user to change the color
	return [];
});

documents.listen(connection);

connection.listen();
