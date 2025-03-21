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
