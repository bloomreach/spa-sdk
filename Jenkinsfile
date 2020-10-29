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
      image 'node:12'
    }
  }

  options {
    gitLabConnection('https://code.onehippo.org/')
  }

  triggers {
    gitlab(
      triggerOnPush: true,
      triggerOnMergeRequest: false,
      includeBranchesSpec: 'release/saas',
      pendingBuildName: 'Sample SPA'
    )
  }

  stages {
    stage('Sample SPA') {
      when {
        tag 'sample-spa-*'
      }

      environment {
        VERSION = sh(script: 'echo $TAG_NAME | sed "s/^[^0-9]*\\([0-9].*\\)$/\\1/"', returnStdout: true).trim()
      }

      stages {
        stage('Verify') {
          steps {
            dir('community/spa-sdk') {
              sh 'HOME=$(pwd) yarn workspaces focus @bloomreach/example-saas'
              sh 'yarn --cwd=examples/saas workspaces foreach --parallel --recursive --topological run build'
              sh 'yarn workspace @bloomreach/example-saas lint'
            }
          }
        }

        stage('Deploy to Heroku') {
          steps {
            dir('community/spa-sdk') {
              sh 'git init'
              sh 'git config user.email "jenkins@onehippo.com"'
              sh 'git config user.name "Jenkins"'
              sh 'git add -A && git commit -m "Deploy $VERSION"'

              withCredentials([[$class: 'StringBinding', credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY']]) {
                sh 'git push --force https://heroku:$HEROKU_API_KEY@git.heroku.com/brxm-react-spa.git master'
              }

              dir('.git') { deleteDir() }
            }
          }
        }
      }
    }
  }
}
