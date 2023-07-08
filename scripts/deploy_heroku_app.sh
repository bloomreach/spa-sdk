#!/bin/bash

set -e

HEROKU_TEAM="bloomreach"
APP_TYPE=$2;
APP_NAME=$3;
APP_VERSION=$4;
NAME=${5:-"${APP_NAME}-${APP_TYPE}-${APP_VERSION}"};

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
elif [[ $APP_TYPE = "csr" ]] && [[ $APP_NAME = "vue3" ]]
then
  APP_PATH="examples/vue3"
elif [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "vue3" ]]
then
# We don't have vue3 ssr app, but the deployment matrix is done in such a way that it will try to deploy the vue3 ssr
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
heroku config:set --app=$NAME NPM_CONFIG_PRODUCTION=false
heroku config:set --app=$NAME PROJECT_PATH=$APP_PATH
heroku config:set --app=$NAME PACKAGE=$APP_PACKAGE
heroku config:set --app=$NAME FRAMEWORK=$APP_NAME
heroku config:set --app=$NAME PROCFILE=$APP_PATH/Procfile

# Set project specific config options
if [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "ng" ]]
then
  heroku config:set --app=$NAME PROCFILE=$APP_PATH/universal.Procfile
elif [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "vue" ]]
then
  heroku config:set --app=$NAME HOST=0.0.0.0
  heroku config:set --app=$NAME NUXT_APP_BR_MULTI_TENANT_SUPPORT=true
fi

if [[ $APP_NAME = "ng" ]]
then
  heroku config:set --app=$NAME BR_MULTI_TENANT_SUPPORT=true
fi

if [[ $APP_TYPE = "csr" ]] && [[ $APP_NAME = "react" ]]
then
  heroku config:set --app=$NAME REACT_APP_BR_MULTI_TENANT_SUPPORT=true
fi

if [[ $APP_TYPE = "ssr" ]] && [[ $APP_NAME = "react" ]]
then
  heroku config:set --app=$NAME NEXT_PUBLIC_BR_MULTI_TENANT_SUPPORT=true
fi

if [[ $APP_TYPE = "csr" ]] && [[ $APP_NAME = "vue" ]]
then
  heroku config:set --app=$NAME VUE_APP_BR_MULTI_TENANT_SUPPORT=true
fi

if [[ $APP_TYPE = "csr" ]] && [[ $APP_NAME = "vue3" ]]
then
  heroku config:set --app=$NAME VITE_MULTI_TENANT_SUPPORT=true
fi

git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$NAME.git HEAD:refs/heads/main

echo "Deploying ${NAME} app using path ${APP_PATH} has been done"
echo '-----------------------------------------------------------------------------'
