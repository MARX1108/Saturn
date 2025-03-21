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
