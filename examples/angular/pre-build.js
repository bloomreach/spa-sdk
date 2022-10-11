/*
 * Copyright 2022 Bloomreach
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

var dotenv = require('dotenv');

dotenv.config();

var fs = require('fs');
var str = `
export const environment = {
    production: true,
    endpoint: '${ process.env.BRXM_ENDPOINT || "" }',
    exponeaProjectToken: '${ process.env.EXPONEA_PROJECT_TOKEN || "" }',
    exponeaApiUrl: '${ process.env.EXPONEA_API_URL || "" }',
    hasMultiTenantSupport: '${ process.env.BR_MULTI_TENANT_SUPPORT || "" }'
};
`;
fs.writeFile("./src/environments/environment.prod.ts", str, function (err) {
  if (err) {
    return console.log(err);
  }
  console.log("environment.prod.ts was saved!");
});
