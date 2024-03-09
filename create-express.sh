#!/bin/bash

yarn init

# Install Express
yarn add express

# ESLint setup
yarn add eslint -D
npx eslint --init
yarn add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
echo '{
  "parser": "@typescript-eslint/parser",
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
  "extends": ["plugin:@typescript-eslint/recommended"],
  "env": {
      "node": true
  },
  "rules": {}
}' > .eslintrc

echo 'node_modules
dist' > .eslintignore

# Adding ESLint scripts
jq '.scripts += {"lint": "eslint src/**/*.ts", "format": "eslint src/**/*.ts --fix"}' package.json > temp.json && mv temp.json package.json

# Prettier setup
yarn add -D prettier eslint-config-prettier
echo 'node_modules
dist' > .prettierignore

echo '{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2
}' > .prettierrc.json


# Define the new scripts
NEW_SCRIPTS='
   "prepare": "husky install",
    "dev": "nodemon ./src/index.ts",
    "start": "ts-node ./src/index.ts",
    "lint": "eslint src/**/*.ts",
    "format": "eslint src/**/*.ts --fix",
    "pretty": "prettier --write \"src/**/*.ts\""
'

# Read the current package.json content
CURRENT_CONTENT=$(<package.json)

# Extract the scripts section from the current content
CURRENT_SCRIPTS=$(grep -E '^\s*"scripts":' <<< "$CURRENT_CONTENT" -A 1000 | sed 's/,$//' | awk '/{/,/}/')

# Merge the new scripts with the existing scripts
MERGED_SCRIPTS=$(awk -v new_scripts="$NEW_SCRIPTS" '/"scripts":/ {print; print new_scripts; next}1' <<< "$CURRENT_CONTENT")

# Update the package.json with the merged scripts
echo "$MERGED_SCRIPTS" > package.json

echo "Scripts added successfully!"

# Husky setup
yarn add husky -D
npx husky-init && yarn
npx husky add .husky/pre-commit "
echo ''
echo 'Linting your code'
echo '----please wait-----'
npx lint-staged
echo 'Linted Successfully!'
echo ''
echo 'Building your code'
echo '----please wait-----'
npm run build
echo 'Built Successfully!'
"
npx husky add .husky/commit-msg "
echo ''
npm run commitlint --edit \$1
"

# Commitlint setup
yarn add @commitlint/{config-conventional,cli} -D
echo '{
  "extends": ["@commitlint/config-conventional"]
}' > .commitlintrc.json

# Adding gitignore
echo '# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?' > .gitignore

yarn add -D typescript
yarn add -D ts-node
touch index.ts
mkdir src 
echo "import express from 'express';

const app = express();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
" > src/index.ts

echo "Environment setup complete!"
