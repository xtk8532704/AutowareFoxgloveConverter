#!/bin/bash

# --- Variable Definitions ---
SOURCE_DIR="sen.evaluator_status_viewer-0.1.0"
TARGET_PARENT_DIR="$HOME/.lichtblick-suite/extensions"
TARGET_DIR="$TARGET_PARENT_DIR/$SOURCE_DIR"

# --- Script Reliability Settings ---
set -e # Exit the script if an error occurs
set -u # Error if an undefined variable is used
set -o pipefail # Exit if an error occurs in the middle of a pipe

# --- Start Processing ---
echo "Starting the installer..."

# 1. Check if the source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Directory '$SOURCE_DIR' does not exist in the current directory." >&2
  exit 1
fi
echo "✓ Source directory '$SOURCE_DIR' confirmed."

# 2. Create the target parent directory if it doesn't exist
if [ ! -d "$TARGET_PARENT_DIR" ]; then
  echo "Target directory '$TARGET_PARENT_DIR' does not exist. Creating it."
  mkdir -p "$TARGET_PARENT_DIR"
  echo "✓ Target directory created."
else
  echo "✓ Target directory '$TARGET_PARENT_DIR' already exists."
fi

# 3. Check if the target directory already exists and ask for overwrite
if [ -d "$TARGET_DIR" ]; then
    echo "Warning: '$TARGET_DIR' already exists. Do you want to overwrite it? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "Deleting existing directory..."
        rm -rf "$TARGET_DIR"
    else
        echo "Installation aborted."
        exit 0
    fi
fi

# 4. Move the folder
echo "Moving '$SOURCE_DIR' to '$TARGET_DIR'..."
cp -r "$SOURCE_DIR" "$TARGET_PARENT_DIR/" # Move it into the parent directory

echo "✓ Installation completed successfully! 🎉"

exit 0
