#!/bin/bash
# Run this from GLVT-WEB root

# 1. Setup apps/ops
echo "Creating apps/ops..."
mkdir -p apps/ops

# 2. Copy Team-roles-os
echo "Copying Team-roles-os..."
# Use absolute path if relative doesn't work
cp -R ../Team-roles-os-/* apps/ops/ 2>/dev/null || echo "Please copy Team-roles-os- content manually to apps/ops"

# 3. Update apps/ops/package.json name to @glvt/ops
if [ -f apps/ops/package.json ]; then
  sed -i '' 's/"name": "team-roles-os"/"name": "@glvt/ops"/' apps/ops/package.json
fi

# 4. Initialize package dependencies
echo "Updating root package.json workspaces..."
# Ensure workspaces includes "apps/*" and "packages/*"

echo "Migration setup complete. Run 'npm install' to link workspaces."
