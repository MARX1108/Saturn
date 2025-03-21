#!/bin/bash
# Usage: send-to-claude.sh file.md "Your question here"

if [ -z "$1" ]; then
  echo "Error: No file specified"
  echo "Usage: send-to-claude.sh file.md \"Your question here\""
  exit 1
fi

if [ ! -f "$1" ]; then
  echo "Error: File not found: $1"
  exit 1
fi

echo "📋 File content is ready for Claude!"
echo "1. Open Claude in your browser"
echo "2. Paste this content:"
echo ""
echo "=== CONTEXT START ==="
cat "$1"
echo "=== CONTEXT END ==="
echo ""

if [ ! -z "$2" ]; then
  echo "3. Add this question: $2"
fi

# Copy to clipboard if possible
if command -v pbcopy &> /dev/null; then
  cat "$1" | pbcopy
  echo "✅ Content copied to clipboard (macOS)"
elif command -v xclip &> /dev/null; then
  cat "$1" | xclip -selection clipboard
  echo "✅ Content copied to clipboard (Linux with xclip)"
elif command -v clip.exe &> /dev/null; then
  cat "$1" | clip.exe
  echo "✅ Content copied to clipboard (Windows/WSL)"
else
  echo "⚠️ Could not copy to clipboard automatically"
  echo "Please manually copy the content above"
fi