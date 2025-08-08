#!/bin/bash

# Backup original package.json
cp package.json package.json.backup

# Add homepage for GitHub Pages deployment
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.homepage = 'https://redelefant-mr-e.github.io/Mitutoyo-Prospecting-Engine';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy

# Restore original package.json
mv package.json.backup package.json

echo "Deployment completed!"
