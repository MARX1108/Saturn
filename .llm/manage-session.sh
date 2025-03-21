#!/bin/bash
# LLM Session Manager - Helps maintain context across Claude conversations

SESSION_DIR=".llm/sessions"
SNIPPETS_DIR=".llm/snippets"
PROMPTS_DIR=".llm/prompts"

function create_session() {
  SESSION_NAME=$1
  mkdir -p "$SESSION_DIR/$SESSION_NAME"
  echo "Session created: $SESSION_NAME"
  echo "Created: $(date)" > "$SESSION_DIR/$SESSION_NAME/info.txt"
}

function add_to_session() {
  SESSION_NAME=$1
  FILE_PATH=$2
  
  if [ ! -d "$SESSION_DIR/$SESSION_NAME" ]; then
    echo "Session $SESSION_NAME doesn't exist. Creating it..."
    create_session "$SESSION_NAME"
  fi
  
  FILENAME=$(basename "$FILE_PATH")
  cp "$FILE_PATH" "$SESSION_DIR/$SESSION_NAME/$FILENAME"
  echo "Added $FILENAME to session $SESSION_NAME"
}

function package_session() {
  SESSION_NAME=$1
  OUTPUT_FILE="${SESSION_NAME}_context.md"
  
  echo "# Session Context: $SESSION_NAME" > "$OUTPUT_FILE"
  echo "Generated: $(date)" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  for file in "$SESSION_DIR/$SESSION_NAME"/*; do
    FILENAME=$(basename "$file")
    echo "## File: $FILENAME" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  done
  
  echo "Session context saved to $OUTPUT_FILE"
}

function save_snippet() {
  NAME=$1
  CONTENT=$2
  echo "$CONTENT" > "$SNIPPETS_DIR/$NAME"
  echo "Snippet saved as $NAME"
}

function get_snippet() {
  NAME=$1
  if [ -f "$SNIPPETS_DIR/$NAME" ]; then
    cat "$SNIPPETS_DIR/$NAME"
  else
    echo "Snippet not found: $NAME"
  fi
}

function list_sessions() {
  echo "Available sessions:"
  ls -l "$SESSION_DIR"
}

function list_snippets() {
  echo "Available snippets:"
  ls -l "$SNIPPETS_DIR"
}

case "$1" in
  create)
    create_session "$2"
    ;;
  add)
    add_to_session "$2" "$3"
    ;;
  package)
    package_session "$2"
    ;;
  save-snippet)
    save_snippet "$2" "$3"
    ;;
  get-snippet)
    get_snippet "$2"
    ;;
  list-sessions)
    list_sessions
    ;;
  list-snippets)
    list_snippets
    ;;
  *)
    echo "Usage:"
    echo "  $0 create <session-name>"
    echo "  $0 add <session-name> <file-path>"
    echo "  $0 package <session-name>"
    echo "  $0 save-snippet <name> <content>"
    echo "  $0 get-snippet <name>"
    echo "  $0 list-sessions"
    echo "  $0 list-snippets"
    ;;
esac
