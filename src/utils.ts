import * as vscode from 'vscode';

export function getHighlightedText(editor: vscode.TextEditor): { highlighted: string | undefined, range: vscode.Range | undefined } {
    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (!text || selection.isEmpty) {
        vscode.window.showWarningMessage('Please select text to highlight.');
        return { highlighted: undefined, range: undefined };
    }

    return { highlighted: text, range: selection };
}
