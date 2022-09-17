#!/bin/bash

set -e

HEROKU_API_KEY="77f6cf76-5d2c-469d-9d4e-13a97a4f4098"
HEROKU_TEAM="bloomreach"
APP_TYPE=$2;
APP_NAME=$3;
APP_VERSION=$4;
NAME=$5 || "${APP_NAME}-${APP_TYPE}-${APP_VERSION}";

if [[ $APP_NAME = "ng" ]]
then
  APP_PATH="examples/angular"
elif [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "vue" ]]
then
  APP_PATH="examples/nuxt"
elif [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "react" ]]
then
  APP_PATH="examples/next"
elif [[ $APP_TYPE = "csr" ]] && [[ $APP_NAME = "vue" ]]
then
  APP_PATH="examples/vue"
elif [[ $APP_TYPE = "csr" ]] && [[ $APP_NAME = "react" ]]
then
  APP_PATH="examples/react"
fi

APP_PACKAGE=$(node -p -e "require('./$APP_PATH/package.json').name")

echo "Deploying ${APP_PACKAGE} as ${NAME} app using path ${APP_PATH}";
echo '-----------------------------------------------------------------------------'

heroku plugins:install buildpack-registry
heroku plugins:install buildpacks

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
heroku config:set --app=$NAME PROJECT_PATH=$APP_PATH
heroku config:set --app=$NAME PACKAGE=$APP_PACKAGE
heroku config:set --app=$NAME PROCFILE=$APP_PATH/Procfile
heroku config:set --app=$NAME PORT=443

# Set project specific config options
if [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "ng" ]]
then
  heroku config:set --app=$NAME PROCFILE=$APP_PATH/universal.Procfile
elif [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "vue" ]]
then
  heroku config:set --app=$NAME HOST=0.0.0.0
fi

git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$NAME.git HEAD:refs/heads/main

echo "Deploying ${NAME} app using path ${APP_PATH} has been done"
echo '-----------------------------------------------------------------------------'
