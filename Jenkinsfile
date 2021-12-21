/*
 * Copyright 2020 Bloomreach
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

  environment {
    // Setup HOME to WORKSPACE path to avoid access errors during npm install
    HOME = "${env.WORKSPACE}"
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

  post {
    cleanup {
      deleteDir()
    }
  }

  stages {
    stage('Install') {
      steps {
        sh 'HOME=$(pwd) yarn'
      }
    }
    stage('Build') {
      steps {
        sh 'yarn build'
      }
    }
    stage('Lint') {
      steps {
        sh 'yarn lint'
      }
    }
    stage('Unit tests') {
      steps {
        sh 'yarn test'
      }
    }
    stage('Deploy to Heroku') {
      when {
        branch 'main'
      }

      environment {
        VERSION = sh(script: "node -p -e \"require('./package.json').version\"", returnStdout: true).trim()
        // Replace dots with dashes in version because the Heroku URL requires dashes
        VERSION_FOR_HEROKU = "${VERSION.replace('.', '-')}"
        HEROKU_TEAM = "bloomreach"
      }
      stages {
        stage('Setup git config') {
          steps {
            sh 'git config user.email "jenkins@onehippo.com"'
            sh 'git config user.name "Jenkins"'
          }
        }
        stage('Deploy apps') {
          matrix {
            axes {
              axis {
                  name 'APP_TYPE'
                  values 'ssr', 'csr'
              }
              axis {
                  name 'APP_NAME'
                  values 'ng', 'react', 'vue'
              }
            }
            stages {
              stage('Deploy app') {
                steps {
                  withCredentials([[$class: 'StringBinding', credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY']]) {
                    sh './scripts/deploy_heroku_app.sh ${APP_TYPE} ${APP_NAME} ${VERSION_FOR_HEROKU}'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
