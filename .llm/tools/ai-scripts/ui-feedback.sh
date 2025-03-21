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
