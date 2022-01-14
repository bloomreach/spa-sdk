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
        sh 'yarn install'
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
    stage('Release') {
      when {
        branch 'SPASDK-82-release-pipeline-final' // TODO: CHANGE TO main
      }

      environment {
        GIT_SSH_COMMAND='ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'
        VERSION = sh(script: "node -p -e \"require('./package.json').version\"", returnStdout: true).trim()
      }

      stages {
        stage('Publish to Github') {
          steps {
            sshagent (credentials: ['github-spa-sdk']) {
              sh 'git remote add github git@github.com:bloomreach/spa-sdk.git'
              sh 'git push -u --follow-tags github HEAD:refs/heads/test-release-pipeline' // TODO: CHANGE TO main
            }
          }
        }
        stage('Setup git config') {
          steps {
            sh 'git config --global user.email "jenkins@code.bloomreach.com"'
            sh 'git config --global user.name "Jenkins"'
          }
        }
        stage('Generate and publish SPA SDK TypeDoc') {
          stages {
            stage('Generate SPA SDK TypeDoc') {
              steps {
                sh 'yarn workspace @bloomreach/spa-sdk docs'
              }
            }
            stage('Clone github pages with TypeDoc') {
              steps {
                sshagent (credentials: ['github-spa-sdk']) {
                  sh 'git clone -b test-release-pipeline-gh-pages --single-branch git@github.com:bloomreach/spa-sdk.git spa-sdk-typedoc' // TODO: CHANGE TO CORRECT BRANCH gh-pages
                }
              }
            }
            stage('Copy new version of TypeDoc') {
              steps {
                sh 'rm -rf spa-sdk-typedoc/*'
                sh 'cp -r packages/spa-sdk/docs/. spa-sdk-typedoc/'
              }
            }
            stage('Publish to github pages') {
              steps {
                sh 'echo $(date +"%T") > spa-sdk-typedoc/test.txt' // REMOVE IT!!!
                sh 'git -C spa-sdk-typedoc add --all'
                sh 'git -C spa-sdk-typedoc commit -m "Update SPA SDK TypeDocs for release ${VERSION}"'
                sshagent (credentials: ['github-spa-sdk']) {
                  sh 'git -C spa-sdk-typedoc push'
                }
              }
            }
            stage('Cleanup') {
              steps {
                sh 'rm -rf spa-sdk-typedoc'
              }
            }
          }
        }
        stage('Publish to NPM') {
          steps {
            withCredentials([[$class: 'StringBinding', credentialsId: 'NPM_AUTH_TOKEN', variable: 'YARN_NPM_AUTH_TOKEN']]) {
              // sh 'yarn release' // TODO: UNCOMMENT BEFORE MERGE!!!
              echo 'Remove ME before MERGE!!!!'
            }
          }
        }
        stage('Deploy to Heroku') {
          environment {
            // Replace dots with dashes in version because the Heroku URL requires dashes
            VERSION_FOR_HEROKU = "${VERSION.replace('.', '-')}-cd-test" // TODO: REMOVE BEFORE MERGE
            HEROKU_TEAM = "bloomreach"
          }

          stages {
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
                        sh 'yarn run deploy-to-heroku "${APP_TYPE}" "${APP_NAME}" "${VERSION_FOR_HEROKU}"'
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
  }
}
