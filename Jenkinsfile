/*
 * Copyright 2020 Hippo B.V. (http://www.onehippo.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

pipeline {
  agent {
    docker {
      label 'docker'
      image 'node:14'
      args '-v  /etc/passwd:/etc/passwd'
    }
  }

  options {
    gitLabConnection('https://code.bloomreach.com/')
    gitlabCommitStatus(name: 'jenkins')
  }

  triggers {
    gitlab(
      triggerOnPush: true,
      pendingBuildName: 'SPA SDK'
    )
  }

  environment {
    VERSION = sh(script: 'echo $TAG_NAME | sed "s/^[^0-9]*\\([0-9].*\\)$/\\1/"', returnStdout: true).trim()
    //Heroku does not accept dots in the app name. So, we need to replace them with dashes
    VERSION_FOR_HEROKU = VERSION.replace('.', '-')
    HEROKU = "/tmp/node_modules/.bin/heroku"
    HEROKU_TEAM = "bloomreach"

    ANGULAR_SSR_APP_NAME = "ng-ssr-${VERSION_FOR_HEROKU}"
    ANGULAR_CSR_APP_NAME = "ng-csr-${VERSION_FOR_HEROKU}"

    REACT_SSR_APP_NAME = "react-ssr-${VERSION_FOR_HEROKU}"
    REACT_CSR_APP_NAME = "react-csr-${VERSION_FOR_HEROKU}"

    VUE_SSR_APP_NAME = "vue-ssr-${VERSION_FOR_HEROKU}"
    VUE_CSR_APP_NAME = "vue-csr-${VERSION_FOR_HEROKU}"

    //React Heroku SPA urls
    REACT_CSR_PUBLIC_URL = "https://${REACT_CSR_APP_NAME}.herokuapp.com"
    REACT_SSR_PUBLIC_URL = "https://${REACT_SSR_APP_NAME}.herokuapp.com"

    //Angular Heroku SPA urls
    ANGULAR_CSR_PUBLIC_URL = "https://${ANGULAR_CSR_APP_NAME}.herokuapp.com"
    ANGULAR_SSR_PUBLIC_URL = "https://${ANGULAR_SSR_APP_NAME}.herokuapp.com"

    //VUE Heroku SPA urls
    VUE_CSR_PUBLIC_URL = "https://${VUE_CSR_APP_NAME}.herokuapp.com"
    VUE_SSR_PUBLIC_URL = "https://${VUE_SSR_APP_NAME}.herokuapp.com"
  }

  stages {
    // stage('Build, Lint & Test') {
    //   steps {
    //     sh 'HOME=$(pwd) yarn'
    //     sh 'yarn build'
    //     sh 'yarn lint'
    //     sh 'yarn test'
    //   }
    // }

    stage('Release') {
      // when {
        // tag 'spa-sdk-*'
      // }

      stages {
        // stage('Publish to NPM') {
        //   steps {
        //     withCredentials([[$class: 'StringBinding', credentialsId: 'NPM_AUTH_TOKEN', variable: 'YARN_NPM_AUTH_TOKEN']]) {
        //       sh 'yarn release'
        //     }
        //   }
        // }

        stage('Publish to GitHub') {
          environment {
            GIT_SSH_COMMAND='ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'
          }

          steps {
            sh 'git remote add github git@github.com:bloomreach/spa-sdk.git'
            sshagent (credentials: ['spa-sdk-github']) {
              sh 'git push github test-pipeline'
              // sh 'git push github ${TAG_NAME}'
            }
          }
        }

        // stage('Publish SPA SDK TypeDoc') {
        //   steps {
        //     sh 'git clone -b gh-pages --single-branch git@github.com:bloomreach/spa-sdk.git packages/spa-sdk/docs'
        //     sh 'cd packages/spa-sdk/docs'
        //     sh 'git rm . -r'
        //     sh 'yarn workspace @bloomreach/spa-sdk docs --disableOutputCheck'
        //     sh 'git add --all'
        //     sh 'git commit -m "Update SPA SDK TypeDocs for release ${TAG_NAME}"'
        //     sshagent (credentials: ['spa-sdk-github']) {
        //       sh 'git push'
        //     }
        //   }
        // }

        // stage('Deploy SPAs on Heroku') {
        //   stages {
        //     stage('Prepare') {
        //       steps {
        //         sh 'npm install --no-save --prefix=/tmp heroku'
        //         sh 'git config user.email "jenkins@onehippo.com"'
        //         sh 'git config user.name "Jenkins"'
        //       }
        //     }

        //     stage('Deploy') {
        //       steps {
        //         parallel (
        //           'Angular': {
        //             withCredentials([[$class: 'StringBinding', credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY']]) {
        //               sh '$HEROKU apps:destroy --app=$ANGULAR_CSR_APP_NAME --confirm $ANGULAR_CSR_APP_NAME || return 0'
        //               sh '$HEROKU apps:create --app=$ANGULAR_CSR_APP_NAME --team=$HEROKU_TEAM'
        //               sh '$HEROKU buildpacks:set --app=$ANGULAR_CSR_APP_NAME heroku/nodejs'
        //               sh '$HEROKU buildpacks:add --app=$ANGULAR_CSR_APP_NAME https://github.com/timanovsky/subdir-heroku-buildpack.git'
        //               sh '$HEROKU buildpacks:add --app=$ANGULAR_CSR_APP_NAME https://github.com/heroku/heroku-buildpack-static.git'
        //               sh '''$HEROKU config:set  --app=$ANGULAR_CSR_APP_NAME \
        //                   PROJECT_PATH=examples/angular
        //               '''

        //               sh 'git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$ANGULAR_CSR_APP_NAME.git main'
        //             }
        //           },

        //           'Angular Universal': {
        //             withCredentials([[$class: 'StringBinding', credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY']]) {
        //               sh '$HEROKU apps:destroy --app=$ANGULAR_SSR_APP_NAME --confirm $ANGULAR_SSR_APP_NAME || return 0'
        //               sh '$HEROKU apps:create --app=$ANGULAR_SSR_APP_NAME --team=$HEROKU_TEAM'
        //               sh '$HEROKU buildpacks:set --app=$ANGULAR_SSR_APP_NAME heroku/nodejs'
        //               sh '$HEROKU buildpacks:add --app=$ANGULAR_SSR_APP_NAME https://github.com/heroku/heroku-buildpack-multi-procfile'
        //               sh '''$HEROKU config:set --app=$ANGULAR_SSR_APP_NAME \
        //                   PROJECT_PATH=examples/angular \
        //                   PROCFILE=examples/angular/universal.Procfile
        //               '''

        //               sh 'git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$ANGULAR_SSR_APP_NAME.git main'
        //             }
        //           },

        //           'React': {
        //             withCredentials([[$class: 'StringBinding', credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY']]) {
        //               sh '$HEROKU apps:destroy --app=$REACT_CSR_APP_NAME --confirm $REACT_CSR_APP_NAME || return 0'
        //               sh '$HEROKU apps:create --app=$REACT_CSR_APP_NAME --team=$HEROKU_TEAM'
        //               sh '$HEROKU buildpacks:set --app=$REACT_CSR_APP_NAME heroku/nodejs'
        //               sh '$HEROKU buildpacks:add --app=$REACT_CSR_APP_NAME https://github.com/timanovsky/subdir-heroku-buildpack.git'
        //               sh '$HEROKU buildpacks:add --app=$REACT_CSR_APP_NAME https://github.com/heroku/heroku-buildpack-static.git'
        //               sh '''$HEROKU config:set  --app=$REACT_CSR_APP_NAME \
        //                   PROJECT_PATH=examples/react
        //               '''

        //               sh 'git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$REACT_CSR_APP_NAME.git main'
        //             }
        //           },

        //           'Next.js': {
        //             withCredentials([[$class: 'StringBinding', credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY']]) {
        //               sh '$HEROKU apps:destroy --app=$REACT_SSR_APP_NAME --confirm $REACT_SSR_APP_NAME || return 0'
        //               sh '$HEROKU apps:create --app=$REACT_SSR_APP_NAME --team=$HEROKU_TEAM'
        //               sh '$HEROKU buildpacks:set --app=$REACT_SSR_APP_NAME heroku/nodejs'
        //               sh '$HEROKU buildpacks:add --app=$REACT_SSR_APP_NAME https://github.com/heroku/heroku-buildpack-multi-procfile'
        //               sh '''$HEROKU config:set --app=$REACT_SSR_APP_NAME \
        //                   PROJECT_PATH=examples/next \
        //                   PROCFILE=examples/next/Procfile
        //               '''

        //               sh 'git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$REACT_SSR_APP_NAME.git main'
        //             }
        //           },

        //           'Vue': {
        //             withCredentials([[$class: 'StringBinding', credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY']]) {
        //               sh '$HEROKU apps:destroy --app=$VUE_CSR_APP_NAME --confirm $VUE_CSR_APP_NAME || return 0'
        //               sh '$HEROKU apps:create --app=$VUE_CSR_APP_NAME --team=$HEROKU_TEAM'
        //               sh '$HEROKU buildpacks:set --app=$VUE_CSR_APP_NAME heroku/nodejs'
        //               sh '$HEROKU buildpacks:add --app=$VUE_CSR_APP_NAME https://github.com/timanovsky/subdir-heroku-buildpack.git'
        //               sh '$HEROKU buildpacks:add --app=$VUE_CSR_APP_NAME https://github.com/heroku/heroku-buildpack-static.git'
        //               sh '''$HEROKU config:set  --app=$VUE_CSR_APP_NAME \
        //                   PROJECT_PATH=examples/vue
        //               '''

        //               sh 'git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$VUE_CSR_APP_NAME.git main'
        //             }
        //           },

        //           'Nuxt.js': {
        //             withCredentials([[$class: 'StringBinding', credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY']]) {
        //               sh '$HEROKU apps:destroy --app=$VUE_SSR_APP_NAME --confirm $VUE_SSR_APP_NAME || return 0'
        //               sh '$HEROKU apps:create --app=$VUE_SSR_APP_NAME --team=$HEROKU_TEAM'
        //               sh '$HEROKU buildpacks:set --app=$VUE_SSR_APP_NAME heroku/nodejs'
        //               sh '$HEROKU buildpacks:add --app=$VUE_SSR_APP_NAME https://github.com/heroku/heroku-buildpack-multi-procfile'
        //               sh '''$HEROKU config:set --app=$VUE_SSR_APP_NAME \
        //                   PROJECT_PATH=examples/nuxt \
        //                   PROCFILE=examples/nuxt/Procfile \
        //                   HOST=0.0.0.0 \
        //                   NPM_CONFIG_PRODUCTION=false \
        //                   NODE_ENV=production
        //               '''

        //               sh 'git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/$VUE_SSR_APP_NAME.git main'
        //             }
        //           }
        //         )
        //       }
        //     }
        //   }
        // }
      }
    }
  }
}
