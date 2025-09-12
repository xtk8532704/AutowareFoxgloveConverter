#!/bin/bash

# build and install the extension
npm install
npm run build
nmp run
npm run local-install

# move layout files
LICHTBLICK_EXTENSIONS_DIR="$HOME/.lichtblick-suite/layouts"
mkdir -p "$LICHTBLICK_EXTENSIONS_DIR"
cp DLRLayout.json "$LICHTBLICK_EXTENSIONS_DIR/"
