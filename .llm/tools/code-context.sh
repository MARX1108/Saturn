#!/bin/bash
# Enhanced code-context.sh: Creates markdown with code from multiple files
# Usage: ./code-context.sh file1.ts file2.ts ... [--title "Custom Title"]

# Default values
TITLE="Code Context"
OUTPUT_DIR="ai-prompts"
MAX_FILE_SIZE=50000  # Characters per file (for future chunking support)

# Process arguments for optional parameters
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --title) TITLE="$2"; shift ;;
    --output-dir) OUTPUT_DIR="$2"; shift ;;
    --max-size) MAX_FILE_SIZE="$2"; shift ;;
    *) FILES+=("$1") ;;
  esac
  shift
done

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Generate timestamp and filename
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT="$OUTPUT_DIR/${TITLE// /-}-${TIMESTAMP}.md"

# Create markdown header
echo "# $TITLE" > "$OUTPUT"
echo "Generated: $(date)" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## Files Included" >> "$OUTPUT"

# List all files being processed
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "- \`$file\`" >> "$OUTPUT"
  fi
done
echo "" >> "$OUTPUT"

# Process each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "## File: $file" >> "$OUTPUT"
    
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
    echo "\`\`\`$LANG" >> "$OUTPUT"
    
    # Future chunking support (commented out for now)
    # if [ $(wc -c < "$file") -gt $MAX_FILE_SIZE ]; then
    #   echo "// Note: This file is large and may be truncated" >> "$OUTPUT"
    #   head -c $MAX_FILE_SIZE "$file" >> "$OUTPUT"
    #   echo "// ... [File truncated due to size] ..." >> "$OUTPUT"
    # else
      cat "$file" >> "$OUTPUT"
    # fi
    
    echo "\`\`\`" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  else
    echo "Error: File not found: $file" >&2
  fi
done

# Add task section
echo "## Task/Question" >> "$OUTPUT"
echo "<!-- Add your question or task for Claude here -->" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "✅ Created $OUTPUT"
echo "📝 Add your task or question at the bottom of the file"

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