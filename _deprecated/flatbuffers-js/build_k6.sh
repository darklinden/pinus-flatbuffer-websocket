#!/bin/bash

yarn
yarn add -D gulp
yarn add -D gulp-concat
yarn add -D rollup

echo "Cleaning..."
rm -rf ./dist
rm -rf ./types
rm -rf ./k6

echo "Building..."
npx tsc --module ESNext

echo "Copying js files..."
npx rollup dist/flatbuffers.js --file k6/flatbuffers/flatbuffers.js --format cjs

echo "Copying d.ts files..."
npx gulp d.ts

# remove lines begin with 'import ' in d.ts files
sed -i.bakup '/^import /d' ./k6/flatbuffers/flatbuffers.d.ts
rm ./k6/flatbuffers/flatbuffers.d.ts.bakup