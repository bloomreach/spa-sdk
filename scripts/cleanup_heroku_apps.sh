#!/bin/bash
# Utility that prompts you to delete the example apps hosted on Heroku. It goes through all the apps that match a pattern and asks if that app should be deleted.

set -e

HEROKU_TEAM="bloomreach"

for line in $( heroku apps --team ${HEROKU_TEAM} | grep '^\(ng\|react\|vue\)' ); do
  echo "Would you like to delete app $line ?  [Y] Yes  [any key] No     "
  read -sn1 input
    if [ "$input" = "Y" ];
    then
        echo "Yes"
        heroku apps:destroy --app=${line} --confirm ${line} || true
    else
        echo "No"
    fi
done
