#!/bin/bash

APP_TYPE=$1;
APP_NAME=$2;
APP_VERSION=$3;
NAME="${APP_NAME}-${APP_TYPE}-${APP_VERSION}";

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

echo "Deploying ${NAME} app using path ${APP_PATH}";
echo '-----------------------------------------------------------------------------'

# Common heroku settup for both ssr and csr apps
$HEROKU_BIN apps:destroy --app=$NAME --confirm $NAME
$HEROKU_BIN apps:create --app=$NAME --team=$HEROKU_TEAM

$HEROKU_BIN buildpacks:set --app=$NAME heroku/nodejs

# Add build packs based on the app type
if [[ $APP_TYPE = "csr" ]]
then
  $HEROKU_BIN buildpacks:add --app=$NAME https://github.com/timanovsky/subdir-heroku-buildpack.git
  $HEROKU_BIN buildpacks:add --app=$NAME https://github.com/heroku/heroku-buildpack-static.git
elif [[ $APP_TYPE = "ssr" ]]
then
  $HEROKU_BIN buildpacks:add --app=$NAME https://github.com/heroku/heroku-buildpack-multi-procfile
fi

# Set common config options
$HEROKU_BIN config:set --app=$NAME PROJECT_PATH=$APP_PATH
$HEROKU_BIN config:set --app=$NAME PROCFILE=$APP_PATH/Procfile


# Set project specific config options
if [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "ng" ]]
then
  $HEROKU_BIN config:set --app=$NAME PROCFILE=$APP_PATH/universal.Procfile
elif [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "vue" ]]
then
  $HEROKU_BIN config:set --app=$NAME HOST=0.0.0.0
fi

git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$NAME.git HEAD:refs/heads/main

echo "Deploying ${NAME} app using path ${APP_PATH} has been done"
echo '-----------------------------------------------------------------------------'
