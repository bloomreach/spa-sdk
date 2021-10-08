#!/usr/bin/env bash

# Assign arguments to variables
HEROKU_API_KEY=$1
# Get current version from package.json
VERSION=$(node -p -e "require('./package.json').version")

# Replace dots with dashes in version because the Heroku URL requires dashes
VERSION_FOR_HEROKU=`echo $VERSION | sed -E "s/^[^0-9]*([0-9].*)$/\1/" | sed -E "s/\./\-/g"`
HEROKU_TEAM="bloomreach"

# Define functions for deploying to Heroku
createCSRApp() {
  local NAME=$1;
  local APP_PATH=$2
  echo "Deploying ${NAME} app using path ${APP_PATH}";
  echo '-----------------------------------------------------------------------------'
  npx heroku apps:destroy --app=$NAME --confirm $NAME
  npx heroku apps:create --app=$NAME --team=$HEROKU_TEAM
  npx heroku buildpacks:set --app=$NAME heroku/nodejs
  npx heroku buildpacks:add --app=$NAME https://github.com/timanovsky/subdir-heroku-buildpack.git
  npx heroku buildpacks:add --app=$NAME https://github.com/heroku/heroku-buildpack-static.git
  npx heroku config:set --app=$NAME PROJECT_PATH=$APP_PATH
  git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$NAME.git main
}

createSSRApp() {
  local NAME=$1;
  local APP_PATH=$2
  echo "Deploying ${NAME} app using path ${APP_PATH}";
  echo '-----------------------------------------------------------------------------'
  npx heroku apps:destroy --app=$NAME --confirm $NAME
  npx heroku apps:create --app=$NAME --team=$HEROKU_TEAM
  npx heroku buildpacks:set --app=$NAME heroku/nodejs
  npx heroku buildpacks:add --app=$NAME https://github.com/heroku/heroku-buildpack-multi-procfile
  npx heroku config:set  --app=$NAME PROJECT_PATH=$APP_PATH PROCFILE=$APP_PATH/universal.Procfile
  git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$NAME.git main
}

# Execute release process
echo "Running release script for ${VERSION} (Heroku postfix: ${VERSION_FOR_HEROKU})"
echo '-----------------------------------------------------------------------------'

echo 'Publishing to github remote'
echo '-----------------------------------------------------------------------------'
# git remote add github git@github.com:bloomreach/spa-sdk.git
# git fetch github
# git push -f --follow-tags github main

echo 'Publishing TypeDoc to github pages'
echo '-----------------------------------------------------------------------------'
# rm ./packages/spa-sdk/docs
# git clone -b gh-pages --single-branch git@github.com:bloomreach/spa-sdk.git packages/spa-sdk/docs

# pushd packages/spa-sdk/docs
# git rm -r .
# popd

# yarn workspace @bloomreach/spa-sdk docs --disableOutputCheck

# pushd packages/spa-sdk/docs
# git add --all
# git commit -m "Update SPA SDK TypeDocs for release ${VERSION}"
# git push
# popd

if [ -z "$HEROKU_API_KEY" ]
then
  echo 'No Heroku API key provided, apps not deployed to Heroku'
  echo '-----------------------------------------------------------------------------'
else
  echo 'Deploying CSR apps to Heroku'
  echo '-----------------------------------------------------------------------------'

  createCSRApp "ng-csr-${VERSION_FOR_HEROKU}" "examples/angular"
  createCSRApp "react-csr-${VERSION_FOR_HEROKU}" "examples/react"
  createCSRApp "vue-csr-${VERSION_FOR_HEROKU}" "examples/vue"

  echo 'Deploying SSR apps to Heroku'
  echo '-----------------------------------------------------------------------------'
  createSSRApp "ng-ssr-${VERSION_FOR_HEROKU}" "examples/angular"
  createSSRApp "react-ssr-${VERSION_FOR_HEROKU}" "examples/next"
  createSSRApp "vue-ssr-${VERSION_FOR_HEROKU}" "examples/nuxt"
fi

echo "Publishing ${VERSION} to 'latest' dist-tag"
echo '-----------------------------------------------------------------------------'
# yarn release
