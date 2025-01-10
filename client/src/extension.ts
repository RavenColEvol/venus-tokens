import * as path from 'path';
import { workspace, ExtensionContext, commands, window } from 'vscode';

import {
	ExecuteCommandParams,
	ExecuteCommandRequest,
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
	VersionedTextDocumentIdentifier,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		},
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [
			{ scheme: 'file', language: 'css' },
			{ scheme: 'file', language: 'scss' },
		],
		synchronize: {
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
		},
	};

	client = new LanguageClient(
		'VenusDesignTokensForVSCodeClient',
		'Venus Design Tokens for VS Code',
		serverOptions,
		clientOptions
	);

	const disposable = commands.registerCommand('venusTokens.replaceAllTokens', async () => {
		const textEditor = window.activeTextEditor;
		if (!textEditor) {
			return;
		}
		const textDocument: VersionedTextDocumentIdentifier = {
			uri: textEditor.document.uri.toString(),
			version: textEditor.document.version,
		};
		const params: ExecuteCommandParams = {
			command: 'venusTokens.replaceAllTokens',
			arguments: [textDocument],
		};
		client.sendRequest(ExecuteCommandRequest.type, params).catch(() => {
			void window.showErrorMessage('Failed to replace all tokens');
		});
	});
	context.subscriptions.push(disposable);
	client.start();
	// client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
