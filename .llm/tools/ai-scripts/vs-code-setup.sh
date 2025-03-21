#!/bin/bash
# vs-code-setup.sh: Configures VS Code settings for optimal AI assistance
# Creates settings for better GitHub Copilot integration

# Define the settings directory
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  SETTINGS_DIR="$HOME/Library/Application Support/Code/User"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  SETTINGS_DIR="$HOME/.config/Code/User"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows with Git Bash or similar
  SETTINGS_DIR="$APPDATA/Code/User"
else
  echo "❌ Unsupported operating system"
  exit 1
fi

# Create the directory if it doesn't exist
mkdir -p "$SETTINGS_DIR"

# Check if settings.json exists
SETTINGS_FILE="$SETTINGS_DIR/settings.json"
if [ ! -f "$SETTINGS_FILE" ]; then
  echo "{}" > "$SETTINGS_FILE"
fi

# Create a temporary file with the new settings
TMP_FILE=$(mktemp)
cat << 'EOF_SETTINGS' > "$TMP_FILE"
{
  "editor.inlineSuggest.enabled": true,
  "github.copilot.enable": {
    "*": true,
    "plaintext": true,
    "markdown": true,
    "typescript": true,
    "typescriptreact": true,
    "javascript": true,
    "javascriptreact": true
  },
  "github.copilot.advanced": {
    "temperature": 0.5,
    "frequency": 0.5,
    "length": 800
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.suggest.completeFunctionCalls": true,
  "javascript.suggest.completeFunctionCalls": true
}
EOF_SETTINGS

# Merge the existing settings with the new ones
if command -v jq &> /dev/null; then
  # If jq is available, use it to merge the JSON files
  jq -s '.[0] * .[1]' "$SETTINGS_FILE" "$TMP_FILE" > "${TMP_FILE}.merged"
  mv "${TMP_FILE}.merged" "$SETTINGS_FILE"
else
  # If jq is not available, simply overwrite with new settings
  mv "$TMP_FILE" "$SETTINGS_FILE"
  echo "⚠️ Merged settings without jq (existing settings may have been lost)"
fi

# Clean up
rm -f "$TMP_FILE"

echo "✅ VS Code settings updated for optimal GitHub Copilot usage"
echo "📝 Restart VS Code to apply the changes"

# Create VS Code keybindings for Copilot
KEYBINDINGS_FILE="$SETTINGS_DIR/keybindings.json"
if [ ! -f "$KEYBINDINGS_FILE" ]; then
  echo "[]" > "$KEYBINDINGS_FILE"
fi

# Create a temporary file with the new keybindings
TMP_FILE=$(mktemp)
cat << 'EOF_KEYBINDINGS' > "$TMP_FILE"
[
  {
    "key": "alt+a",
    "command": "github.copilot.generate",
    "when": "editorTextFocus"
  },
  {
    "key": "alt+t",
    "command": "editor.action.commentLine",
    "when": "editorTextFocus"
  },
  {
    "key": "alt+]",
    "command": "github.copilot.acceptNextLine",
    "when": "editorTextFocus && github.copilot.activated && github.copilot.inlineSuggestionVisible"
  },
  {
    "key": "alt+c",
    "command": "editor.action.insertSnippet",
    "args": {
      "snippet": "// Generate comprehensive tests for this component using Jest and React Testing Library\n// Include tests for:\n// - Rendering without errors\n// - User interactions\n// - Edge cases\n// - Accessibility\n"
    },
    "when": "editorTextFocus"
  }
]
EOF_KEYBINDINGS

# Merge the existing keybindings with the new ones
if command -v jq &> /dev/null; then
  # If jq is available, use it to merge the JSON files
  jq -s '.[0] + .[1]' "$KEYBINDINGS_FILE" "$TMP_FILE" > "${TMP_FILE}.merged"
  mv "${TMP_FILE}.merged" "$KEYBINDINGS_FILE"
else
  # If jq is not available, simply overwrite with new keybindings
  mv "$TMP_FILE" "$KEYBINDINGS_FILE"
  echo "⚠️ Merged keybindings without jq (existing keybindings may have been lost)"
fi

# Clean up
rm -f "$TMP_FILE"

echo "✅ VS Code keybindings updated for GitHub Copilot"
echo "📝 Restart VS Code to apply the changes"
