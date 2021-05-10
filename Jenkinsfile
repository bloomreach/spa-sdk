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
      args '-v  /etc/passwd:/etc/passwd'
    }
  }

  options {
    gitLabConnection('https://code.bloomreach.com/')
  }

  triggers {
    gitlab(
      triggerOnPush: true,
      triggerOnMergeRequest: false,
      includeBranchesSpec: 'main',
      pendingBuildName: 'SPA SDK'
    )
  }

  stages {
    stage('SPA SDK') {
      stages {
        stage('Build') {
          steps {
            dir('.') {
              sh 'HOME=$(pwd) yarn'
              sh 'yarn build'
              sh 'yarn lint'
              sh 'yarn test'
            }
          }
        }
      }
    }
  }
}
