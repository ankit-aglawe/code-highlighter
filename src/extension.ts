import * as vscode from 'vscode';
import { getHighlightedText } from './utils';
import * as path from 'path';
import * as fs from 'fs';

// Array to track highlights and their decorations
let highlightDecorations: { range: vscode.Range, decoration: vscode.TextEditorDecorationType, color: string }[] = [];

// Contrasting color list with reduced opacity
let contrastingColors = [
    { name: 'Jungle Getaway', color: 'rgba(125, 225, 152, 0.2)', emoji: '🟢' },  // Green
    { name: 'Orange', color: 'rgba(255, 140, 0, 0.2)', emoji: '🟠' },            // Orange
    { name: 'Purple', color: 'rgba(138, 43, 226, 0.2)', emoji: '🟣' },           // Purple
    { name: 'Blue', color: 'rgba(70, 130, 180, 0.2)', emoji: '🔵' },             // Blue
    { name: 'Red', color: 'rgba(220, 20, 60, 0.2)', emoji: '🔴' }                // Red
];

let colorIndex = 0; // To keep track of cycling through the colors

// Function to get the next color in the cycle
function getNextColor(): { color: string, name: string } {
    const colorObj = contrastingColors[colorIndex % contrastingColors.length];
    colorIndex += 1;
    return { color: colorObj.color, name: colorObj.name };
}

export function activate(context: vscode.ExtensionContext) {
    // Check if single-color mode is enabled
    const config = vscode.workspace.getConfiguration('highlightSettings');
    const useSingleColor = config.get<boolean>('useSingleColor', false);
    const customColors = config.get<string[]>('customColors', []);
    if (customColors.length > 0) {
        // Replace contrastingColors with custom colors
        contrastingColors = customColors.map((color, index) => ({
            name: `Custom Color ${index + 1}`,
            color: color,
            emoji: '🎨'
        }));
    }

    // Define the path to the highlights file
    const highlightsFilePath = vscode.workspace.workspaceFolders
        ? path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscode', 'highlights.json')
        : null;

    // Load persisted highlights
    if (highlightsFilePath && fs.existsSync(highlightsFilePath)) {
        const highlightsJson = fs.readFileSync(highlightsFilePath, 'utf8');
        const savedHighlights = JSON.parse(highlightsJson);
        savedHighlights.forEach((savedHighlight: any) => {
            const range = new vscode.Range(
                new vscode.Position(savedHighlight.start.line, savedHighlight.start.character),
                new vscode.Position(savedHighlight.end.line, savedHighlight.end.character)
            );
            const highlightDecoration = vscode.window.createTextEditorDecorationType({
                backgroundColor: savedHighlight.color,
                borderRadius: '5px'
            });
            highlightDecorations.push({ range, decoration: highlightDecoration, color: savedHighlight.color });
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                editor.setDecorations(highlightDecoration, [range]);
            }
        });
    }

    // Update decorations when the active editor changes
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            highlightDecorations.forEach(({ range, decoration }) => {
                editor.setDecorations(decoration, [range]);
            });
        }
    });

    // Register Hover Provider to display options when hovering over text
    context.subscriptions.push(
        vscode.languages.registerHoverProvider({ scheme: 'file', language: '*' }, {
            provideHover(document, position, token) {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return;
                }

                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) {
                    return;
                }

                // Check if the position is within any highlighted range
                const isHighlighted = highlightDecorations.some(({ range }) => range.contains(position));

                // Prepare the hover content with options
                let hoverContent: vscode.MarkdownString;
                if (isHighlighted) {
                    hoverContent = new vscode.MarkdownString(
                        `✏️ [Erase Highlight](command:extension.removeHighlight) | 🎨 [Change Highlight Color](command:extension.changeHighlightColor)`
                    );
                } else {
                    hoverContent = new vscode.MarkdownString(
                        `🌟 [Highlight Code](command:extension.highlightCode)`
                    );
                }

                hoverContent.isTrusted = true; // Ensure commands are executable
                return new vscode.Hover(hoverContent, wordRange);
            }
        })
    );

    // Command to highlight the code
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.highlightCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            const { highlighted, range } = getHighlightedText(editor);
            if (!range || highlightDecorations.some(({ range: highlightedRange }) => highlightedRange.isEqual(range))) {
                return; // Prevent duplicate highlights
            }

            // Get the color based on whether single-color mode is enabled
            const { color: highlightColor, name: colorName } = useSingleColor
                ? { color: contrastingColors[0].color, name: contrastingColors[0].name }
                : getNextColor();

            const highlightDecoration = vscode.window.createTextEditorDecorationType({
                backgroundColor: highlightColor,
                borderRadius: '5px'
            });

            editor.setDecorations(highlightDecoration, [range]);
            highlightDecorations.push({ range, decoration: highlightDecoration, color: highlightColor }); // Track this decoration
            vscode.window.showInformationMessage(`Code highlighted with ${colorName}!`);

            // Save highlights
            saveHighlightsToFile();
        })
    );

    // Command to remove highlight
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.removeHighlight', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            const position = editor.selection.active;
            const selection = editor.selection;

            // Find the highlighted range that contains the position or intersects with the selection
            const index = highlightDecorations.findIndex(({ range }) =>
                range.contains(position) || range.intersection(selection) !== undefined);

            if (index !== -1) {
                const { range, decoration } = highlightDecorations[index];
                editor.setDecorations(decoration, []); // Remove highlight
                decoration.dispose(); // Dispose of the decoration type
                highlightDecorations.splice(index, 1); // Remove from tracking
                vscode.window.showInformationMessage('Highlight removed!');
                // Save highlights
                saveHighlightsToFile();
            }
        })
    );

    // Command to change highlight color
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.changeHighlightColor', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            const position = editor.selection.active;
            const selection = editor.selection;

            // Find the highlighted range that contains the position or intersects with the selection
            const index = highlightDecorations.findIndex(({ range }) =>
                range.contains(position) || range.intersection(selection) !== undefined);

            if (index !== -1) {
                const { range, decoration } = highlightDecorations[index];

                // Display color options to the user
                const colorOptions = contrastingColors.map(colorObj => ({
                    label: `${colorObj.emoji} ${colorObj.name}`,
                    description: '',
                    color: colorObj.color
                }));

                const selectedColor = await vscode.window.showQuickPick(colorOptions, {
                    placeHolder: 'Select a new highlight color'
                });

                if (selectedColor) {
                    // Dispose the old decoration
                    editor.setDecorations(decoration, []);
                    decoration.dispose();

                    // Create new decoration with new color
                    const newDecoration = vscode.window.createTextEditorDecorationType({
                        backgroundColor: selectedColor.color,
                        borderRadius: '5px'
                    });

                    // Apply the new decoration
                    editor.setDecorations(newDecoration, [range]);

                    // Update the decoration in the array
                    highlightDecorations[index].decoration = newDecoration;
                    highlightDecorations[index].color = selectedColor.color;

                    vscode.window.showInformationMessage(`Highlight color changed to ${selectedColor.label}!`);

                    // Save highlights
                    saveHighlightsToFile();
                }
            }
        })
    );

    // Command to search highlights
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.searchHighlights', async () => {
            if (highlightDecorations.length === 0) {
                vscode.window.showInformationMessage('No highlights to display.');
                return;
            }

            const highlightOptions = highlightDecorations.map(({ range, color }, index) => {
                const editor = vscode.window.activeTextEditor;
                const text = editor?.document.getText(range) || 'Highlighted Text';
                return {
                    label: `Highlight ${index + 1}`,
                    description: text.trim(),
                    detail: `Line ${range.start.line + 1}`,
                    range: range,
                    color: color
                };
            });

            const selectedHighlight = await vscode.window.showQuickPick(highlightOptions, {
                placeHolder: 'Select a highlight to navigate to'
            });

            if (selectedHighlight && vscode.window.activeTextEditor) {
                const editor = vscode.window.activeTextEditor;
                editor.selection = new vscode.Selection(selectedHighlight.range.start, selectedHighlight.range.end);
                editor.revealRange(selectedHighlight.range, vscode.TextEditorRevealType.InCenter);
            }
        })
    );

    // Function to save highlights to file
    function saveHighlightsToFile() {
        if (!highlightsFilePath) return;
        const highlightsToSave = highlightDecorations.map(({ range, color }) => ({
            start: { line: range.start.line, character: range.start.character },
            end: { line: range.end.line, character: range.end.character },
            color: color
        }));
        const highlightsJson = JSON.stringify(highlightsToSave, null, 4);
        // Ensure the .vscode directory exists
        const dir = path.dirname(highlightsFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(highlightsFilePath, highlightsJson);
    }
}

export function deactivate() {
    // Dispose of all decorations
    highlightDecorations.forEach(({ decoration }) => decoration.dispose());
    highlightDecorations = [];
}


