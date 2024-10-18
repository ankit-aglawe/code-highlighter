<div align="center">

![LOGO](images/icon128.png)

# Highlightify - Code Highlighter

**Easily highlight and manage important sections of your code in Visual Studio Code.**
</div>

## Features

- **Highlight Code**: Quickly highlight selected code to mark important sections.
- **Erase Highlights**: Remove highlights when they're no longer needed.
- **Change Highlight Color**: Customize the color of your highlights for better organization.
- **Persistent Highlights**: Keep highlights saved across sessions.
- **Customizable Colors**: Define your own set of highlight colors in settings.
- **Keyboard Shortcuts**: Use shortcuts to perform actions faster.
- **Search Highlights**: Quickly navigate to highlighted sections.
- **Integration with Version Control**: Decide whether to share highlights with your team.

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by pressing `Ctrl+Shift+X`.
3. Search for **Code Highlighter**.
4. Click **Install** to install the extension.
5. Reload VS Code if prompted.

## Usage

### Highlighting Code

- **Method 1**: Select the code you want to highlight, right-click, and choose **Highlight Code**.
- **Method 2**: Use the command palette (`Ctrl+Shift+P`), type **Highlight Code**, and press Enter.
- **Method 3**: Hover over selected text and click on **Highlight Code** in the hover menu.
- **Method 4**: Use the keyboard shortcut `Ctrl+Alt+H`.

### Erasing Highlights

- **Method 1**: Hover over the highlighted code and click **Erase Highlight**.
- **Method 2**: Select the highlighted code, open the command palette, and run **Erase Highlight**.
- **Method 3**: Use the keyboard shortcut `Ctrl+Alt+E`.

### Changing Highlight Color

- Hover over the highlighted code and click **Change Highlight Color**.
- Choose a new color from the list of options provided.
- You can also use the keyboard shortcut `Ctrl+Alt+C`.

### Searching Highlights

- Use the command palette (`Ctrl+Shift+P`), type **Search Highlights**, and press Enter.
- Alternatively, use the keyboard shortcut `Ctrl+Alt+S`.
- Select a highlight from the list to navigate to it.

## Commands and Keyboard Shortcuts

| Command                           | Description                      | Default Shortcut |
|-----------------------------------|----------------------------------|------------------|
| `extension.highlightCode`         | Highlight selected code          | `Ctrl+Alt+H`     |
| `extension.removeHighlight`       | Remove code highlight            | `Ctrl+Alt+E`     |
| `extension.changeHighlightColor`  | Change highlight color           | `Ctrl+Alt+C`     |
| `extension.searchHighlights`      | Search and navigate highlights   | `Ctrl+Alt+S`     |

*Shortcuts can be customized in VS Code keyboard settings.*

## Configuration

### Use Single Color

- **Setting**: `highlightSettings.useSingleColor`
- **Description**: When enabled, all highlights will use the first color in the list.
- **Default**: `false`

### Custom Highlight Colors

- **Setting**: `highlightSettings.customColors`
- **Description**: Define your own set of highlight colors (in `rgba` format).
- **Default**: `[]` (Uses predefined colors)

**Example:**

```json
"highlightSettings.customColors": [
    "rgba(255, 0, 0, 0.2)", // Red
    "rgba(0, 255, 0, 0.2)", // Green
    "rgba(0, 0, 255, 0.2)"  // Blue
]
```

## Integration with Version Control

Highlights are saved in the `.vscode/highlights.json` file in your workspace. You can choose to:

- **Include in Version Control**: Share highlights with your team.
- **Exclude from Version Control**: Keep highlights personal by adding the file to `.gitignore`.

## Contributing

Contributions are welcome! Please submit issues and pull requests on [GitHub](https://github.com/ankit-aglawe/code-highlighter).

## License

This project is licensed under the MIT License.
