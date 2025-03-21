#!/bin/bash
# Create a directory for all scripts
mkdir -p ai-scripts
cd ai-scripts

# Create the enhanced code-context script for Claude/ChatGPT Mac apps
cat > code-context.sh << 'EOF'
#!/bin/bash
# code-context.sh: Creates markdown with code from multiple files for Claude/ChatGPT Mac apps
# Usage: ./code-context.sh file1.ts file2.ts ...

# Default values
TITLE="Code Context"
OUTPUT_DIR="ai-prompts"
CLIPBOARD_ONLY=false

# Process arguments for optional parameters
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --title) TITLE="$2"; shift ;;
    --clipboard-only) CLIPBOARD_ONLY=true ;;
    *) FILES+=("$1") ;;
  esac
  shift
done

# Create output directory if it doesn't exist and not clipboard only
if [ "$CLIPBOARD_ONLY" = false ]; then
  mkdir -p "$OUTPUT_DIR"
fi

# Generate markdown content
CONTENT="# $TITLE\nGenerated: $(date)\n\n## Files Included\n"

# List all files being processed
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    CONTENT+="- \`$file\`\n"
  fi
done
CONTENT+="\n"

# Process each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    CONTENT+="## File: $file\n"
    
    # Get file extension for language detection
    FILE_EXT="${file##*.}"
    
    # Determine language based on extension
    case "$FILE_EXT" in
      js|ts|jsx|tsx) LANG="typescript" ;;
      css) LANG="css" ;;
      html) LANG="html" ;;
      json) LANG="json" ;;
      md) LANG="markdown" ;;
      *) LANG="$FILE_EXT" ;;
    esac
    
    # Add code block with proper language
    CONTENT+="\`\`\`$LANG\n"
    CONTENT+="$(cat "$file")\n"
    CONTENT+="\`\`\`\n\n"
  else
    echo "Error: File not found: $file" >&2
  fi
done

# Add task section
CONTENT+="## Task/Question\n<!-- Add your question or task here -->\n\n"

# Output to file if not clipboard only
if [ "$CLIPBOARD_ONLY" = false ]; then
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  OUTPUT="$OUTPUT_DIR/${TITLE// /-}-${TIMESTAMP}.md"
  echo -e "$CONTENT" > "$OUTPUT"
  echo "✅ Created $OUTPUT"
fi

# Copy to clipboard
if command -v pbcopy &> /dev/null; then
  echo -e "$CONTENT" | pbcopy
  echo "✅ Content copied to clipboard (macOS)"
elif command -v xclip &> /dev/null; then
  echo -e "$CONTENT" | xclip -selection clipboard
  echo "✅ Content copied to clipboard (Linux with xclip)"
elif command -v clip.exe &> /dev/null; then
  echo -e "$CONTENT" | clip.exe
  echo "✅ Content copied to clipboard (Windows/WSL)"
else
  echo "⚠️ Could not copy to clipboard automatically"
  echo "Please copy the content manually if needed"
fi

echo "📝 Paste this content into Claude or ChatGPT Mac app"
EOF

# Make script executable
chmod +x code-context.sh

# Create the debug-error script
cat > debug-error.sh << 'EOF'
#!/bin/bash
# debug-error.sh: Runs a command and captures errors/output for Claude/ChatGPT Mac apps
# Usage: ./debug-error.sh "your command here"

# Parse options
CLIPBOARD_ONLY=false
while getopts ":c" opt; do
  case $opt in
    c) CLIPBOARD_ONLY=true ;;
    \?) echo "Invalid option: -$OPTARG" >&2; exit 1 ;;
  esac
done
shift $((OPTIND-1))

# Check if a command was provided
if [ -z "$1" ]; then
  echo "Error: No command specified"
  echo "Usage: ./debug-error.sh [-c] \"your command here\""
  exit 1
fi

# Store the command for reference
CMD="$@"

# Generate content
CONTENT="# Debug Context\nGenerated: $(date)\n\n"
CONTENT+="## Command Executed\n\`\`\`bash\n$CMD\n\`\`\`\n\n"
CONTENT+="## Environment\n\`\`\`\n"
CONTENT+="Node.js: $(node -v 2>/dev/null || echo 'Not installed')\n"
CONTENT+="NPM: $(npm -v 2>/dev/null || echo 'Not installed')\n"
CONTENT+="Yarn: $(yarn -v 2>/dev/null || echo 'Not installed')\n"
CONTENT+="OS: $(uname -a)\n"
CONTENT+="\`\`\`\n\n"
CONTENT+="## Output & Errors\n\`\`\`\n"

# Run the command and capture output/errors
OUTPUT_LOG=$(mktemp)
ERROR_LOG=$(mktemp)

# Run command, tee output to terminal and capture to files
($@ 2> >(tee "$ERROR_LOG" >&2) > >(tee "$OUTPUT_LOG"))
EXITCODE=$?

# Add output to content
CONTENT+="$(cat "$OUTPUT_LOG")\n"
if [ -s "$ERROR_LOG" ]; then
  CONTENT+="\n### Errors\n$(cat "$ERROR_LOG")\n"
fi
CONTENT+="\`\`\`\n\n"

CONTENT+="## Exit Code\nCommand completed with exit code: $EXITCODE\n\n"
CONTENT+="## Notes & Context\n### What were you trying to do?\n<!-- Describe your intention here -->\n\n"
CONTENT+="### What have you tried already?\n<!-- List any solutions you've already attempted -->\n\n"
CONTENT+="### Relevant code files\n<!-- List any files that might be relevant to this error -->\n\n"

# Clean up temp files
rm "$OUTPUT_LOG" "$ERROR_LOG"

# Output to file if not clipboard only
if [ "$CLIPBOARD_ONLY" = false ]; then
  OUTPUT_DIR="ai-prompts"
  mkdir -p "$OUTPUT_DIR"
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  OUTPUT="$OUTPUT_DIR/debug-error-${TIMESTAMP}.md"
  echo -e "$CONTENT" > "$OUTPUT"
  echo "✅ Created $OUTPUT"
fi

# Copy to clipboard
if command -v pbcopy &> /dev/null; then
  echo -e "$CONTENT" | pbcopy
  echo "✅ Content copied to clipboard (macOS)"
elif command -v xclip &> /dev/null; then
  echo -e "$CONTENT" | xclip -selection clipboard
  echo "✅ Content copied to clipboard (Linux with xclip)"
elif command -v clip.exe &> /dev/null; then
  echo -e "$CONTENT" | clip.exe
  echo "✅ Content copied to clipboard (Windows/WSL)"
else
  echo "⚠️ Could not copy to clipboard automatically"
fi

echo "📝 Paste this content into Claude or ChatGPT Mac app"
EOF

chmod +x debug-error.sh

# Create UI feedback script
cat > ui-feedback.sh << 'EOF'
#!/bin/bash
# ui-feedback.sh: Get AI feedback on a UI component
# Usage: ./ui-feedback.sh component.tsx [--screenshot screenshot.png]

# Check for component file
if [ -z "$1" ]; then
  echo "❌ Error: No component file specified"
  echo "Usage: ./ui-feedback.sh component.tsx [--screenshot screenshot.png]"
  exit 1
fi

COMPONENT_FILE="$1"
SCREENSHOT=""

# Check for optional screenshot
if [ "$2" = "--screenshot" ] && [ -n "$3" ]; then
  SCREENSHOT="$3"
fi

if [ ! -f "$COMPONENT_FILE" ]; then
  echo "❌ Error: Component file not found: $COMPONENT_FILE"
  exit 1
fi

if [ -n "$SCREENSHOT" ] && [ ! -f "$SCREENSHOT" ]; then
  echo "❌ Error: Screenshot file not found: $SCREENSHOT"
  exit 1
fi

# Generate content
CONTENT="# UI Component Feedback Request\nGenerated: $(date)\n\n"
CONTENT+="## Component Code\n\`\`\`tsx\n$(cat "$COMPONENT_FILE")\n\`\`\`\n\n"

# If screenshot is provided, add a note about it
if [ -n "$SCREENSHOT" ]; then
  CONTENT+="## Component Screenshot\n"
  CONTENT+="A screenshot of this component is available at: $SCREENSHOT\n"
  CONTENT+="Please review the screenshot alongside the code.\n\n"
fi

# Add specific UI/UX review questions
CONTENT+="## Feedback Questions\n\n"
CONTENT+="1. **UI Design**: Is the component visually appealing and consistent with modern UI practices?\n"
CONTENT+="2. **Usability**: Are there any usability concerns with this component?\n"
CONTENT+="3. **Accessibility**: What accessibility improvements could be made?\n"
CONTENT+="4. **Performance**: Are there any obvious performance concerns?\n"
CONTENT+="5. **Code Quality**: How can the component code be improved?\n"
CONTENT+="6. **Mobile Responsiveness**: How will this component behave on mobile devices?\n"
CONTENT+="7. **Suggestions**: What specific improvements would you recommend?\n\n"

# Copy to clipboard
if command -v pbcopy &> /dev/null; then
  echo -e "$CONTENT" | pbcopy
  echo "✅ Content copied to clipboard (macOS)"
elif command -v xclip &> /dev/null; then
  echo -e "$CONTENT" | xclip -selection clipboard
  echo "✅ Content copied to clipboard (Linux with xclip)"
elif command -v clip.exe &> /dev/null; then
  echo -e "$CONTENT" | clip.exe
  echo "✅ Content copied to clipboard (Windows/WSL)"
else
  echo "⚠️ Could not copy to clipboard automatically"
fi

echo "📝 Paste this content into Claude or ChatGPT Mac app"

# Optionally save to file
OUTPUT_DIR="ai-prompts"
mkdir -p "$OUTPUT_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT="$OUTPUT_DIR/ui-feedback-${TIMESTAMP}.md"
echo -e "$CONTENT" > "$OUTPUT"
echo "✅ Also saved to $OUTPUT"
EOF

chmod +x ui-feedback.sh

# Create a test generation script
cat > generate-tests.sh << 'EOF'
#!/bin/bash
# generate-tests.sh: Generate tests for a component or module
# Usage: ./generate-tests.sh component.tsx

# Check for component file
if [ -z "$1" ]; then
  echo "❌ Error: No file specified"
  echo "Usage: ./generate-tests.sh component.tsx"
  exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
  echo "❌ Error: File not found: $FILE"
  exit 1
fi

# Determine file type
FILE_EXT="${FILE##*.}"
FILE_NAME=$(basename "$FILE")
FILE_DIR=$(dirname "$FILE")

# Generate content
CONTENT="# Test Generation Request\nGenerated: $(date)\n\n"
CONTENT+="## File to Test\n\`\`\`$FILE_EXT\n$(cat "$FILE")\n\`\`\`\n\n"

# Look for existing tests
TEST_FILE=""
case "$FILE_EXT" in
  tsx|jsx)
    POTENTIAL_TEST="${FILE_NAME%.*}.test.${FILE_EXT}"
    if [ -f "$FILE_DIR/$POTENTIAL_TEST" ]; then
      TEST_FILE="$FILE_DIR/$POTENTIAL_TEST"
    fi
    ;;
  ts|js)
    POTENTIAL_TEST="${FILE_NAME%.*}.test.${FILE_EXT}"
    if [ -f "$FILE_DIR/$POTENTIAL_TEST" ]; then
      TEST_FILE="$FILE_DIR/$POTENTIAL_TEST"
    fi
    ;;
esac

# If there's an existing test file, include it
if [ -n "$TEST_FILE" ]; then
  CONTENT+="## Existing Tests\n\`\`\`$FILE_EXT\n$(cat "$TEST_FILE")\n\`\`\`\n\n"
  CONTENT+="Please enhance the existing tests above.\n"
else
  CONTENT+="## No Existing Tests Found\nPlease generate comprehensive tests for this file.\n"
fi

CONTENT+="\n## Testing Requirements\n\n"

case "$FILE_EXT" in
  tsx|jsx)
    CONTENT+="Please generate React component tests using:\n"
    CONTENT+="- Jest as the test runner\n"
    CONTENT+="- React Testing Library for component testing\n"
    CONTENT+="- Mock any external dependencies\n"
    CONTENT+="- Test both rendering and interactions\n"
    CONTENT+="- Consider edge cases and error states\n"
    ;;
  ts|js)
    CONTENT+="Please generate unit tests using:\n"
    CONTENT+="- Jest as the test runner\n"
    CONTENT+="- Mock any external dependencies\n"
    CONTENT+="- Achieve high code coverage\n"
    CONTENT+="- Test edge cases and error handling\n"
    ;;
esac

CONTENT+="\n## Expected Output\n"
CONTENT+="Please provide a complete test file that I can save as \`${FILE_NAME%.*}.test.${FILE_EXT}\`\n\n"

# Copy to clipboard
if command -v pbcopy &> /dev/null; then
  echo -e "$CONTENT" | pbcopy
  echo "✅ Content copied to clipboard (macOS)"
elif command -v xclip &> /dev/null; then
  echo -e "$CONTENT" | xclip -selection clipboard
  echo "✅ Content copied to clipboard (Linux with xclip)"
elif command -v clip.exe &> /dev/null; then
  echo -e "$CONTENT" | clip.exe
  echo "✅ Content copied to clipboard (Windows/WSL)"
else
  echo "⚠️ Could not copy to clipboard automatically"
fi

echo "📝 Paste this content into Claude or ChatGPT Mac app"

# Optionally save to file
OUTPUT_DIR="ai-prompts"
mkdir -p "$OUTPUT_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT="$OUTPUT_DIR/test-generation-${TIMESTAMP}.md"
echo -e "$CONTENT" > "$OUTPUT"
echo "✅ Also saved to $OUTPUT"
EOF

chmod +x generate-tests.sh

# Create VS Code Copilot helper script
cat > copilot-prompt.sh << 'EOF'
#!/bin/bash
# copilot-prompt.sh: Creates improved prompts for GitHub Copilot
# Usage: ./copilot-prompt.sh [--task task_type]

TASK_TYPE="general"

# Process arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --task) TASK_TYPE="$2"; shift ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

# Generate appropriate prompt template based on task type
case "$TASK_TYPE" in
  test)
    PROMPT="// Test for the above code using Jest\n// Include the following test cases:\n// 1. Test rendering without errors\n// 2. Test all user interactions\n// 3. Test edge cases\n// 4. Mock any external dependencies\n\nimport { render, screen, fireEvent } from '@testing-library/react';\n\ndescribe('Component tests', () => {\n  "
    ;;
  accessibility)
    PROMPT="// Improve accessibility of the above component\n// Follow WCAG 2.1 AA standards\n// Add appropriate aria attributes\n// Ensure keyboard navigation works\n// Maintain proper heading hierarchy\n// Use semantic HTML elements\n"
    ;;
  refactor)
    PROMPT="// Refactor the above code to improve:\n// 1. Performance\n// 2. Readability\n// 3. Maintainability\n// 4. Follow React best practices\n// 5. Type safety\n"
    ;;
  api)
    PROMPT="// Create an API endpoint handler for the following requirements:\n// - Handle authentication and authorization\n// - Validate input data\n// - Implement proper error handling\n// - Follow RESTful principles\n// - Include appropriate status codes\n"
    ;;
  *)
    PROMPT="// Help me implement the following:\n// - Make the code clean and maintainable\n// - Use TypeScript for type safety\n// - Follow React best practices\n// - Ensure good performance\n// - Make it accessible\n"
    ;;
esac

# Copy to clipboard
if command -v pbcopy &> /dev/null; then
  echo -e "$PROMPT" | pbcopy
  echo "✅ Prompt copied to clipboard (macOS)"
elif command -v xclip &> /dev/null; then
  echo -e "$PROMPT" | xclip -selection clipboard
  echo "✅ Prompt copied to clipboard (Linux with xclip)"
elif command -v clip.exe &> /dev/null; then
  echo -e "$PROMPT" | clip.exe
  echo "✅ Prompt copied to clipboard (Windows/WSL)"
else
  echo "⚠️ Could not copy to clipboard automatically"
  echo -e "$PROMPT"
fi

echo "📝 Paste this prompt as a comment in your code file and press Enter"
echo "💡 GitHub Copilot will then generate code based on this context"
EOF

chmod +x copilot-prompt.sh

# Create a VS Code settings helper
cat > vs-code-setup.sh << 'EOF'
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
EOF

chmod +x vs-code-setup.sh

# Create a shell script for installation
cat > install.sh << 'EOF'
#!/bin/bash
# Install AI development scripts

# Copy scripts to a global location
mkdir -p ~/ai-scripts
cp *.sh ~/ai-scripts/

# Add to PATH if not already there
if ! grep -q "ai-scripts" ~/.bashrc; then
  echo 'export PATH="$HOME/ai-scripts:$PATH"' >> ~/.bashrc
  echo "✅ Added scripts to PATH in ~/.bashrc"
fi

if ! grep -q "ai-scripts" ~/.zshrc 2>/dev/null; then
  if [ -f ~/.zshrc ]; then
    echo 'export PATH="$HOME/ai-scripts:$PATH"' >> ~/.zshrc
    echo "✅ Added scripts to PATH in ~/.zshrc"
  fi
fi

# Optionally set up VS Code
read -p "Do you want to set up VS Code settings for GitHub Copilot? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ./vs-code-setup.sh
fi

echo "✅ Installation complete!"
echo "🔄 Please restart your terminal or run 'source ~/.bashrc' to use the scripts"
echo ""
echo "Available commands:"
echo "- code-context.sh: Create context from code files for Claude/ChatGPT"
echo "- debug-error.sh: Capture errors for debugging with Claude/ChatGPT"
echo "- ui-feedback.sh: Get AI feedback on UI components via Claude/ChatGPT"
echo "- generate-tests.sh: Generate tests via Claude/ChatGPT"
echo "- copilot-prompt.sh: Generate effective prompts for GitHub Copilot"
EOF

chmod +x install.sh

echo "✅ All scripts created successfully!"
echo "📂 Scripts are in the 'ai-scripts' directory"
echo "🚀 Run './install.sh' to install the scripts for easy access"