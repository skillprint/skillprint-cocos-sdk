#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "=== 🚀 Starting build and release process ==="

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
  echo "❌ Could not determine current git branch. Aborting."
  exit 1
fi

# 1. Build the project to verify it compiles before making any changes
echo "Building the SDK..."
npm run build

# 2. Check if git working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ Working directory is not clean. Please commit or stash your changes before releasing."
  exit 1
fi

# 3. Increment minor version, update package.json, commit, and create git tag
echo "Incrementing minor version..."
# npm version minor will update version (e.g. 0.0.1 -> 0.1.0), commit it, and create a git tag (v0.1.0)
NEW_VERSION=$(npm version minor)
echo "New version: $NEW_VERSION"

# 4. Push git commit and tags to remote origin
echo "Pushing changes and tags to GitHub ($CURRENT_BRANCH)..."
git push origin "$CURRENT_BRANCH"
git push origin "$NEW_VERSION"

# 5. Publish to npm
echo "Publishing to npm..."
# This will run interactively and prompt for 2FA OTP if required by the account settings
npm publish

# 6. Create GitHub release
echo "Creating GitHub release..."
if which gh > /dev/null 2>&1; then
  gh release create "$NEW_VERSION" --title "$NEW_VERSION" --notes "Release $NEW_VERSION of @skillprint/cocos-sdk"
  echo "GitHub release created successfully."
else
  echo "⚠️ GitHub CLI (gh) not found or not authenticated. Skipping release creation."
fi

echo "=== 🎉 Release $NEW_VERSION successfully published! ==="
