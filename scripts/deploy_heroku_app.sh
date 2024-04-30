#!/bin/bash

set -e

HEROKU_TEAM="bloomreach"
APP_TYPE=$2;
APP_FRAMEWORK=$3;
APP_VERSION=$4;
NAME=${5:-"${APP_FRAMEWORK}-${APP_TYPE}-${APP_VERSION}"};

echo "type ${APP_TYPE}"
echo "framework ${APP_FRAMEWORK}"
echo "version ${APP_VERSION}"
echo "name ${NAME}"

if [[ $APP_FRAMEWORK = "ng" ]]
then
  APP_PATH="examples/angular"
elif [[ $APP_TYPE = "ssr" ]] && [[ $APP_FRAMEWORK = "react" ]]
then
  APP_PATH="examples/next"
elif [[ $APP_TYPE = "csr" ]] && [[ $APP_FRAMEWORK = "vue" ]]
then
  APP_PATH="examples/vue"
elif [[ $APP_TYPE = "csr" ]] && [[ $APP_FRAMEWORK = "react" ]]
then
  APP_PATH="examples/react"
elif [[ $APP_TYPE = "ssr" ]] && [[ $APP_FRAMEWORK = "vue" ]]
then
# We don't have vue ssr app, but the deployment matrix is done in such a way that it will try to deploy the vue ssr
# So we ignore this until we add ssr app to Heroku
  exit 0
fi

APP_PACKAGE=$(node -p -e "require('./$APP_PATH/package.json').name")

echo "Deploying ${APP_PACKAGE} as ${NAME} app using path ${APP_PATH}";
echo '-----------------------------------------------------------------------------'

# Common heroku settup for both ssr and csr apps
heroku apps:destroy --app=$NAME --confirm $NAME || true
heroku apps:create --app=$NAME --team=$HEROKU_TEAM

heroku buildpacks:set --app=$NAME heroku/nodejs

# Add build packs based on the app type
if [[ $APP_TYPE = "csr" ]]
then
  heroku buildpacks:add --app=$NAME https://github.com/timanovsky/subdir-heroku-buildpack.git
  heroku buildpacks:add --app=$NAME https://github.com/heroku/heroku-buildpack-nginx.git
elif [[ $APP_TYPE = "ssr" ]]
then
  heroku buildpacks:add --app=$NAME https://github.com/heroku/heroku-buildpack-multi-procfile
fi

# Set common config options
heroku config:set --app=$NAME NPM_CONFIG_PRODUCTION=false \
  PROJECT_PATH=$APP_PATH \
  SDK_NAME=$APP_FRAMEWORK \
  PACKAGE=$APP_PACKAGE \
  PROCFILE=$APP_PATH/Procfile

# Set project specific config options
if [[ $APP_FRAMEWORK = "ng" ]]
then
  heroku config:set --app=$NAME EXAMPLE_NAME="angular" BR_MULTI_TENANT_SUPPORT=true
fi

if [[ $APP_TYPE = "ssr" ]] && [[ $APP_FRAMEWORK = "ng" ]]
then
  heroku config:set --app=$NAME PROCFILE=$APP_PATH/universal.Procfile
fi

if [[ $APP_TYPE = "csr" ]] && [[ $APP_FRAMEWORK = "react" ]]
then
  heroku config:set --app=$NAME EXAMPLE_NAME="react" REACT_APP_BR_MULTI_TENANT_SUPPORT=true
fi

if [[ $APP_TYPE = "ssr" ]] && [[ $APP_FRAMEWORK = "react" ]]
then
  heroku config:set --app=$NAME EXAMPLE_NAME="next" NEXT_PUBLIC_BR_MULTI_TENANT_SUPPORT=true
fi

if [[ $APP_TYPE = "csr" ]] && [[ $APP_FRAMEWORK = "vue" ]]
then
  heroku config:set --app=$NAME EXAMPLE_NAME="vue" VITE_MULTI_TENANT_SUPPORT=true
fi

git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$NAME.git HEAD:refs/heads/main

echo "Deploying ${NAME} app using path ${APP_PATH} has been done"
echo '-----------------------------------------------------------------------------'
