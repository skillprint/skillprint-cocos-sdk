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

# 3. Determine version bump type (from argument or prompt)
BUMP_TYPE=$1

if [ -z "$BUMP_TYPE" ]; then
  echo "Select version bump type:"
  echo "1) patch (e.g. bump last digit)"
  echo "2) minor (e.g. bump middle digit)"
  echo "3) major (e.g. bump first digit)"
  read -p "Enter choice [1-3] (default: patch): " choice

  case "$choice" in
    2) BUMP_TYPE="minor" ;;
    3) BUMP_TYPE="major" ;;
    *) BUMP_TYPE="patch" ;;
  esac
fi

# Validate bump type
if [ "$BUMP_TYPE" != "patch" ] && [ "$BUMP_TYPE" != "minor" ] && [ "$BUMP_TYPE" != "major" ]; then
  echo "❌ Invalid bump type '$BUMP_TYPE'. Must be 'patch', 'minor', or 'major'."
  exit 1
fi

echo "Incrementing $BUMP_TYPE version..."
NEW_VERSION=$(npm version "$BUMP_TYPE")
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
