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