/*
 * Copyright 2020-2025 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
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
              image 'guergeiro/pnpm:20-8'
      args '-v  /etc/passwd:/etc/passwd'
    }
  }

  environment {
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
        sh 'pnpm install'
      }
    }
    stage('Build') {
      steps {
        sh 'pnpm build'
      }
    }
    stage('Lint') {
      steps {
        sh 'pnpm lint'
      }
    }
    stage('Unit tests') {
      steps {
        sh 'pnpm test'
      }
    }
    stage('Setup git config') {
      steps {
        sh 'git remote add github git@github.com:bloomreach/spa-sdk.git'
        sh 'git config --global user.email "jenkins@code.bloomreach.com"'
        sh 'git config --global user.name "Jenkins"'
      }
    }
    stage('Generate and publish docs') {
      when {
        branch 'main'
      }

      environment {
        GIT_SSH_COMMAND='ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'
        VERSION = sh(script: "node -p -e \"require('./packages/spa-sdk/package.json').version\"", returnStdout: true).trim()
      }

      stages {
        stage('Build TypeDoc') {
          steps {
            sh 'pnpm --filter @bloomreach/spa-sdk run typedoc'
          }
        }
        stage('Build docs') {
          steps {
            sh 'cd docs && pnpm install && pnpm build'
          }
        }
        stage('Clone github docs branch') {
          steps {
            sshagent (credentials: ['github-spa-sdk']) {
              sh 'cd docs'
              sh 'git clone -b gh-pages --single-branch git@github.com:bloomreach/spa-sdk.git github-pages-root'
            }
          }
        }
        stage('Copy TypeDoc & docs') {
          steps {
            sh 'rm -rf github-pages-root/*'
            sh 'cp -r packages/spa-sdk/docs/. github-pages-root/'
            sh 'mkdir github-pages-root/docs'
            sh 'cp -r docs/dist/. github-pages-root/docs/'
          }
        }
        stage('Publish to github pages') {
          steps {
            sh 'git -C github-pages-root add --all'
            sh 'git -C github-pages-root commit -m "Update SPA SDK docs for release ${VERSION}"'
            sshagent (credentials: ['github-spa-sdk']) {
              sh 'git -C github-pages-root push'
            }
          }
        }
        stage('Cleanup') {
          steps {
            sh 'rm -rf github-pages-root'
          }
        }
      }
    }
    stage('Release') {
      when {
        branch 'main'
      }

      environment {
        GIT_SSH_COMMAND='ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'
        VERSION = sh(script: "node -p -e \"require('./packages/spa-sdk/package.json').version\"", returnStdout: true).trim()
      }

      stages {
        stage('Fetch tags') {
          steps {
            sshagent (credentials: ['a9511950-0b5d-4727-aa82-a0d7f205b1f4']) {
              sh 'git fetch --tags'
            }
          }
        }
        stage('Publish to Github') {
          steps {
            sshagent (credentials: ['github-spa-sdk']) {
              sh 'git push github HEAD:refs/heads/main'
              sh 'git push github "spa-sdk-${VERSION}"'
            }
          }
        }
        stage('Publish to NPM') {
          steps {
            withCredentials([[$class: 'StringBinding', credentialsId: 'NPM_AUTH_TOKEN', variable: 'NPM_AUTH_TOKEN']]) {
              sh 'echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" >> ~/.npmrc'
              sh 'pnpm release -- --yes'
            }
          }
        }
        stage('Deploy to Heroku') {
          environment {
            // Replace dots with dashes in version because the Heroku URL requires dashes
            VERSION_FOR_HEROKU = "${VERSION.replace('.', '-')}"
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
                        sh 'pnpm deploy-to-heroku "${APP_TYPE}" "${APP_NAME}" "${VERSION_FOR_HEROKU}"'
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
