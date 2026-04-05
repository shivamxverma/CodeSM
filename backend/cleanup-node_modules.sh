#!/bin/sh
# Remove unnecessary files from node_modules to reduce Docker image size

set -e

echo "🧹 Starting node_modules cleanup..."

cd /app/node_modules || exit 1

# Remove TypeScript source files (not needed in production)
echo "  → Removing TypeScript source files..."
find . -name "*.ts" -not -path "*/@types/*" -type f -delete 2>/dev/null || true
find . -name "*.tsx" -type f -delete 2>/dev/null || true

# Remove source maps
echo "  → Removing source maps..."
find . -name "*.map" -type f -delete 2>/dev/null || true
find . -name "*.js.map" -type f -delete 2>/dev/null || true

# Remove markdown and documentation files
echo "  → Removing documentation files..."
find . -name "*.md" -type f -delete 2>/dev/null || true
find . -name "*.markdown" -type f -delete 2>/dev/null || true
find . -name "README" -type f -delete 2>/dev/null || true
find . -name "CONTRIBUTING" -type f -delete 2>/dev/null || true
find . -name "AUTHORS" -type f -delete 2>/dev/null || true

# Remove test files and directories
echo "  → Removing test files..."
find . -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.test.js" -type f -delete 2>/dev/null || true
find . -name "*.spec.js" -type f -delete 2>/dev/null || true
find . -name "*.test.ts" -type f -delete 2>/dev/null || true
find . -name "*.spec.ts" -type f -delete 2>/dev/null || true

# Remove example and sample files
echo "  → Removing examples..."
find . -name "example" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "examples" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "sample" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "samples" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "demo" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "demos" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove documentation directories
echo "  → Removing documentation directories..."
find . -name "docs" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "doc" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "website" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".github" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove coverage files
echo "  → Removing coverage files..."
find . -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".nyc_output" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove CI/CD config files
echo "  → Removing CI/CD configs..."
find . -name ".travis.yml" -type f -delete 2>/dev/null || true
find . -name ".gitlab-ci.yml" -type f -delete 2>/dev/null || true
find . -name "appveyor.yml" -type f -delete 2>/dev/null || true
find . -name ".circleci" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "azure-pipelines.yml" -type f -delete 2>/dev/null || true
find . -name "circle.yml" -type f -delete 2>/dev/null || true

# Remove editor/linter config files
echo "  → Removing editor configs..."
find . -name ".editorconfig" -type f -delete 2>/dev/null || true
find . -name ".eslintrc*" -type f -delete 2>/dev/null || true
find . -name ".jshintrc" -type f -delete 2>/dev/null || true
find . -name ".prettierrc*" -type f -delete 2>/dev/null || true
find . -name ".stylelintrc*" -type f -delete 2>/dev/null || true
find . -name "tslint.json" -type f -delete 2>/dev/null || true
find . -name "jsconfig.json" -type f -delete 2>/dev/null || true
find . -name "tsconfig.json" -type f -delete 2>/dev/null || true

# Remove git files
echo "  → Removing git files..."
find . -name ".git" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".gitignore" -type f -delete 2>/dev/null || true
find . -name ".gitattributes" -type f -delete 2>/dev/null || true
find . -name ".gitmodules" -type f -delete 2>/dev/null || true

# Remove changelog files
echo "  → Removing changelogs..."
find . -name "CHANGELOG*" -type f -delete 2>/dev/null || true
find . -name "HISTORY*" -type f -delete 2>/dev/null || true
find . -name "CHANGES*" -type f -delete 2>/dev/null || true

# Remove yarn/npm/bun artifacts
echo "  → Removing package manager artifacts..."
find . -name ".yarn-integrity" -type f -delete 2>/dev/null || true
find . -name ".package-lock.json" -type f -delete 2>/dev/null || true
find . -name "yarn.lock" -type f -delete 2>/dev/null || true
find . -name "package-lock.json" -type f -delete 2>/dev/null || true
find . -name "bun.lockb" -type f -delete 2>/dev/null || true
find . -name ".bun" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove .d.ts files (TypeScript declarations) - keep only @types
echo "  → Removing TypeScript declarations..."
find . -name "*.d.ts" -not -path "*/@types/*" -type f -delete 2>/dev/null || true

# Remove benchmark files
echo "  → Removing benchmarks..."
find . -name "benchmark" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "benchmarks" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove bower files
echo "  → Removing bower files..."
find . -name "bower.json" -type f -delete 2>/dev/null || true
find . -name ".bower.json" -type f -delete 2>/dev/null || true

# Remove Makefile
echo "  → Removing Makefiles..."
find . -name "Makefile" -type f -delete 2>/dev/null || true
find . -name "makefile" -type f -delete 2>/dev/null || true

# Remove .bin symlinks that are broken or duplicates
echo "  → Cleaning .bin directory..."
find .bin -type l ! -exec test -e {} \; -delete 2>/dev/null || true

echo "✅ Cleanup completed successfully!"
