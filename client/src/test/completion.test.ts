import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate } from './helper';

suite('Should do completion', () => {
	const docUri = getDocUri('completion.css');

	test('Completes CSS Variables of Venus Tokens', async () => {
		// Checks if these tokens exists in autocompletions
		const items = [
			{ label: '--color-base-gray-25', kind: vscode.CompletionItemKind.Color },
			{ label: '--opacity-2', kind: vscode.CompletionItemKind.Text}
		];
		await testCompletion(docUri, new vscode.Position(0, 0), {
			items:items
		});
	});
});

async function testCompletion(
	docUri: vscode.Uri,
	position: vscode.Position,
	expectedCompletionList: vscode.CompletionList
) {
	await activate(docUri);

	const actualCompletionList = (await vscode.commands.executeCommand(
		'vscode.executeCompletionItemProvider',
		docUri,
		position
	)) as vscode.CompletionList;

	assert.ok(actualCompletionList.items.length >= 2);
	expectedCompletionList.items.forEach((expectedItem) => {
		const { label, kind } = expectedItem;
		assert.ok(actualCompletionList.items.find(item => {
			return item.label === label && item.kind === kind;
		}));
	});
}