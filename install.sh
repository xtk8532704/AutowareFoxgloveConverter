#!/bin/bash

# build and install the extension
npm install
npm run build
nmp run
npm run local-install

# install evaluator_status_viewer
cd ./evaluator_status_viewer
bash ./install.sh
cd ..

# move layout files
LICHTBLICK_EXTENSIONS_DIR="$HOME/.lichtblick-suite/"
mkdir -p "$LICHTBLICK_EXTENSIONS_DIR"
cp -r ./layouts "$LICHTBLICK_EXTENSIONS_DIR/"
