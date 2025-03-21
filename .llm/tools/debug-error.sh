#!/bin/bash
# Enhanced debug-error.sh: Runs a command and captures errors/output in markdown
# Usage: ./debug-error.sh "your command here"

OUTPUT_DIR="ai-prompts"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT="$OUTPUT_DIR/debug-error-${TIMESTAMP}.md"

# Store the command for reference
CMD="$@"

echo "# Debug Context" > "$OUTPUT"
echo "Generated: $(date)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "## Command Executed" >> "$OUTPUT"
echo "\`\`\`bash" >> "$OUTPUT"
echo "$CMD" >> "$OUTPUT"
echo "\`\`\`" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "## Environment" >> "$OUTPUT"
echo "\`\`\`" >> "$OUTPUT"
echo "Node.js: $(node -v 2>/dev/null || echo 'Not installed')" >> "$OUTPUT"
echo "NPM: $(npm -v 2>/dev/null || echo 'Not installed')" >> "$OUTPUT"
echo "Yarn: $(yarn -v 2>/dev/null || echo 'Not installed')" >> "$OUTPUT"
echo "OS: $(uname -a)" >> "$OUTPUT"
echo "\`\`\`" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "## Output & Errors" >> "$OUTPUT"
echo "\`\`\`" >> "$OUTPUT"

# Run the command and capture output/errors
OUTPUT_LOG=$(mktemp)
ERROR_LOG=$(mktemp)

# Run command, tee output to terminal and capture to files
($@ 2> >(tee "$ERROR_LOG" >&2) > >(tee "$OUTPUT_LOG"))
EXITCODE=$?

# Append output to markdown file
cat "$OUTPUT_LOG" >> "$OUTPUT"
echo "" >> "$OUTPUT"
if [ -s "$ERROR_LOG" ]; then
  echo "### Errors" >> "$OUTPUT"
  cat "$ERROR_LOG" >> "$OUTPUT"
fi
echo "\`\`\`" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "## Exit Code" >> "$OUTPUT"
echo "Command completed with exit code: $EXITCODE" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "## Notes & Context" >> "$OUTPUT"
echo "### What were you trying to do?" >> "$OUTPUT"
echo "<!-- Describe your intention here -->" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "### What have you tried already?" >> "$OUTPUT"
echo "<!-- List any solutions you've already attempted -->" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "### Relevant code files" >> "$OUTPUT"
echo "<!-- List any files that might be relevant to this error -->" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Clean up temp files
rm "$OUTPUT_LOG" "$ERROR_LOG"

echo "✅ Created $OUTPUT"
echo "📝 Add your notes and context at the bottom of the file"

# Copy to clipboard if possible
if command -v pbcopy &> /dev/null; then
  cat "$OUTPUT" | pbcopy
  echo "✅ Content copied to clipboard (macOS)"
elif command -v xclip &> /dev/null; then
  cat "$OUTPUT" | xclip -selection clipboard
  echo "✅ Content copied to clipboard (Linux with xclip)"
elif command -v clip.exe &> /dev/null; then
  cat "$OUTPUT" | clip.exe
  echo "✅ Content copied to clipboard (Windows/WSL)"
else
  echo "⚠️ Could not copy to clipboard automatically"
fi