#!/usr/bin/env bash

# Assign arguments to variables
HEROKU_API_KEY=$1

# Get current version from package.json
VERSION=$(node -p -e "require('./package.json').version")

# Replace dots with dashes in version because the Heroku URL requires dashes
VERSION_FOR_HEROKU=`echo $VERSION | sed -E "s/^[^0-9]*([0-9].*)$/\1/" | sed -E "s/\./\-/g"`
ANGULAR_SSR_APP_NAME="ng-ssr-${VERSION_FOR_HEROKU}"
ANGULAR_CSR_APP_NAME="ng-csr-${VERSION_FOR_HEROKU}"
REACT_SSR_APP_NAME="react-ssr-${VERSION_FOR_HEROKU}"
REACT_CSR_APP_NAME="react-csr-${VERSION_FOR_HEROKU}"
VUE_SSR_APP_NAME="vue-ssr-${VERSION_FOR_HEROKU}"
VUE_CSR_APP_NAME="vue-csr-${VERSION_FOR_HEROKU}"
HEROKU_TEAM="bloomreach"

# Define functions for deploying to Heroku
createCSRApp() {
  local NAME=$1;
  echo "Deploying ${NAME} app";
  npx heroku apps:destroy --app=$NAME --confirm $NAME || return 0
  npx heroku apps:create --app=$NAME --team=$HEROKU_TEAM
  npx heroku buildpacks:set --app=$NAME heroku/nodejs
  npx heroku buildpacks:add --app=$NAME https://github.com/timanovsky/subdir-heroku-buildpack.git
  npx heroku buildpacks:add --app=$NAME https://github.com/heroku/heroku-buildpack-static.git
  npx heroku config:set --app=$NAME PROJECT_PATH=examples/angular
  git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$NAME.git main
}

createSSRApp() {
  local NAME=$1;
  echo "Deploying ${NAME} app";
  npx heroku apps:destroy --app=$NAME --confirm $NAME || return 0
  npx heroku apps:create --app=$NAME --team=$HEROKU_TEAM
  npx heroku buildpacks:set --app=$NAME heroku/nodejs
  npx heroku buildpacks:add --app=$NAME https://github.com/heroku/heroku-buildpack-multi-procfile
  npx heroku config:set  --app=$NAME PROJECT_PATH=examples/angular PROCFILE=examples/angular/universal.Procfile
  git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$NAME.git main
}

# Execute release process
#------------------------------------------------------------------------------
echo "Running release script for ${VERSION} (Heroku postfix: ${VERSION_FOR_HEROKU})"

echo 'Publishing to github remote'
git remote add github git@github.com:bloomreach/spa-sdk.git
git fetch github
git push --follow-tags github github/main

echo 'Publishing TypeDoc to github pages'
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

if [-z "$HEROKU_API_KEY"]
then
  echo 'No Heroku API key provided, apps not deployed to Heroku'
else
  echo 'Deploying CSR apps to Heroku'
  createCSRApp $ANGULAR_CSR_APP_NAME
  createCSRApp $REACT_CSR_APP_NAME
  createCSRApp $VUE_CSR_APP_NAME

  echo 'Deploying SSR apps to Heroku'
  createSSRApp $ANGULAR_SSR_APP_NAME
  createSSRApp $REACT_SSR_APP_NAME
  createSSRApp $VUE_SSR_APP_NAME
fi

echo "Publishing ${VERSION} to 'latest' dist-tag"
yarn release
