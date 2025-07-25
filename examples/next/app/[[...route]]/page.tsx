/*
 * Copyright 2024-2025 Bloomreach
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

import {headers} from 'next/headers';
import BrxApp from '../../components/BrxApp';
import {Configuration, extractSearchParams, initialize} from '@bloomreach/spa-sdk';
import axios from 'axios';
import * as cookieUtils from 'cookie';
import {DEFAULT_RELEVANCE_COOKIE_NAME} from '../../constants';

export default async function Page() {
  const headersList = await headers();
  const searchParams = headersList.get('x-next-search-params');
  const pathname = headersList.get('x-next-pathname');
  const cookie = headersList.get('x-next-cookie');
  const ip = headersList.get('x-next-forwarded-for');

  const { [DEFAULT_RELEVANCE_COOKIE_NAME]: value } = cookieUtils.parse(cookie ?? '');
  const visitor = value ? JSON.parse(value) : '';

  let configuration = {
    path: `${pathname}?${searchParams}`,
    endpoint: process.env.NEXT_APP_BRXM_ENDPOINT,
    debug: true,
  } as Configuration;

  if (!process.env.NEXT_APP_BRXM_ENDPOINT && process.env.NEXT_PUBLIC_BR_MULTI_TENANT_SUPPORT) {
    const endpointQueryParameter = 'endpoint';
    const { searchParams: extractedParams } = extractSearchParams(configuration.path!, [endpointQueryParameter].filter(Boolean));

    configuration = {
      ...configuration,
      endpoint: extractedParams.get(endpointQueryParameter) ?? '',
      baseUrl: `?${endpointQueryParameter}=${extractedParams.get(endpointQueryParameter)}`,
    };
  }

  const page = await initialize({
    ...configuration,
    visitor,
    request: {
      headers: {cookie: cookie ?? ''},
      connection: {remoteAddress: ip ?? ''},
    },
    httpClient: axios
  });

  const pageModel = page.isPreview() ? undefined : page.toJSON();

  return (
    <BrxApp configuration={configuration} page={pageModel} />
  )
}
