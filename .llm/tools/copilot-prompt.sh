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
