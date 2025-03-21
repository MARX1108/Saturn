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
