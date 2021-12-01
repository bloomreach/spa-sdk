#!/usr/bin/env bash

# Assign arguments to variables
HEROKU_API_KEY=$1
# Get current version from package.json
VERSION=$(node -p -e "require('./package.json').version")

# Replace dots with dashes in version because the Heroku URL requires dashes
VERSION_FOR_HEROKU=`echo $VERSION | sed -E "s/^[^0-9]*([0-9].*)$/\1/" | sed -E "s/\./\-/g"`
HEROKU_TEAM="bloomreach"

# Define function for deploying to Heroku
createApp() {
  local APP_TYPE=$1;
  local APP_NAME=$2;
  local APP_VERSION=$3;
  local APP_PATH=$4;
  local NAME="${APP_NAME}-${APP_TYPE}-${APP_VERSION}";

  echo "Deploying ${NAME} app using path ${APP_PATH}";
  echo '-----------------------------------------------------------------------------'

  # Common heroku settup for both ssr and csr apps
  npx heroku apps:destroy --app=$NAME --confirm $NAME
  npx heroku apps:create --app=$NAME --team=$HEROKU_TEAM

  npx heroku buildpacks:set --app=$NAME heroku/nodejs

  # Add build packs based on the app type
  if [[ $APP_TYPE = "csr" ]]
  then
    npx heroku buildpacks:add --app=$NAME https://github.com/timanovsky/subdir-heroku-buildpack.git
    npx heroku buildpacks:add --app=$NAME https://github.com/heroku/heroku-buildpack-static.git
  elif [[ $APP_TYPE = "ssr" ]]
  then
    npx heroku buildpacks:add --app=$NAME https://github.com/heroku/heroku-buildpack-multi-procfile
  fi

  # Set common config options
  npx heroku config:set --app=$NAME PROJECT_PATH=$APP_PATH
  npx heroku config:set --app=$NAME PROCFILE=$APP_PATH/Procfile


  # Set project specific config options
  if [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "ng" ]]
  then
    npx heroku config:set --app=$NAME PROCFILE=$APP_PATH/universal.Procfile
  elif [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "vue" ]]
  then
    npx heroku config:set --app=$NAME HOST=0.0.0.0
  fi

  git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$NAME.git main

  echo "Deploying ${NAME} app using path ${APP_PATH} has been done"
  echo '-----------------------------------------------------------------------------'
}

# Execute release process
echo "Running release script for ${VERSION} (Heroku postfix: ${VERSION_FOR_HEROKU})"
echo '-----------------------------------------------------------------------------'

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

if [ -z "$HEROKU_API_KEY" ]
then
  echo 'No Heroku API key provided, apps not deployed to Heroku'
  echo '-----------------------------------------------------------------------------'
else
  echo 'Deploying CSR apps to Heroku'
  echo '-----------------------------------------------------------------------------'

  createApp "csr" "ng" ${VERSION_FOR_HEROKU} "examples/angular"
  createApp "csr" "react" ${VERSION_FOR_HEROKU} "examples/react"
  createApp "csr" "vue" ${VERSION_FOR_HEROKU} "examples/vue"

  echo 'Deploying SSR apps to Heroku'
  echo '-----------------------------------------------------------------------------'

  createApp "ssr" "ng" ${VERSION_FOR_HEROKU} "examples/angular"
  createApp "ssr" "react" ${VERSION_FOR_HEROKU} "examples/next"
  createApp "ssr" "vue" ${VERSION_FOR_HEROKU} "examples/nuxt"
fi

echo "Build packages"
echo '-----------------------------------------------------------------------------'
yarn build

echo "Publishing ${VERSION} to 'latest' dist-tag"
echo '-----------------------------------------------------------------------------'
yarn release
