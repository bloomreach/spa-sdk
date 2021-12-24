#!/usr/bin/env bash

# Get current version from package.json
VERSION=$(node -p -e "require('./package.json').version")

# Execute release process
echo "Running release script for ${VERSION}"
echo '-----------------------------------------------------------------------------'

echo "Build packages"
echo '-----------------------------------------------------------------------------'
yarn build || exit 1

echo "Running lint"
echo '-----------------------------------------------------------------------------'
yarn lint || exit 1

echo "Running tests"
echo '-----------------------------------------------------------------------------'
yarn test || exit 1

echo 'Publishing to github remote'
echo '-----------------------------------------------------------------------------'
git remote add github git@github.com:bloomreach/spa-sdk.git
git fetch github
git push -f --follow-tags github main

echo 'Publishing TypeDoc to github pages'
echo '-----------------------------------------------------------------------------'
rm -fr ./packages/spa-sdk/docs
git clone -b gh-pages --single-branch git@github.com:bloomreach/spa-sdk.git packages/spa-sdk/docs

pushd packages/spa-sdk/docs
git rm -r .
popd

yarn workspace @bloomreach/spa-sdk docs --disableOutputCheck

pushd packages/spa-sdk/docs
git add --all
git commit -m "Update SPA SDK TypeDocs for release ${VERSION}"
git push
popd

echo "Publishing ${VERSION} to 'latest' dist-tag"
echo '-----------------------------------------------------------------------------'
yarn release
