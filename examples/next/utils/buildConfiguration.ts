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

import { Configuration, extractSearchParams } from '@bloomreach/spa-sdk';
import { NEXT_PUBLIC_BR_MULTI_TENANT_SUPPORT, BRXM_ENDPOINT } from './constants';

type BuildConfigurationOptions = {
  endpoint: string | (string | null)[];
  baseUrl: string;
};

type ConfigurationBuilder = Omit<Configuration & Partial<BuildConfigurationOptions>, 'httpClient'>;

export function buildConfiguration(
  path: string,
  endpoint: string = BRXM_ENDPOINT,
  hasMultiTenantSupport: boolean = NEXT_PUBLIC_BR_MULTI_TENANT_SUPPORT,
): ConfigurationBuilder {
  const configuration: ConfigurationBuilder = {
    path,
  };
  if (endpoint) {
    configuration.endpoint = endpoint;
    // The else statement below is needed for multi-tenant support
    // It allows operating the same Reference SPA for different channels in EM using endpoint query parameter in the URL
    // It's used mainly by BloomReach and is not needed for most customers
  } else if (hasMultiTenantSupport) {
    const endpointQueryParameter = 'endpoint';
    const { url, searchParams } = extractSearchParams(path, [endpointQueryParameter].filter(Boolean));

    configuration.endpoint = searchParams.get(endpointQueryParameter) ?? '';
    configuration.baseUrl = `?${endpointQueryParameter}=${searchParams.get(endpointQueryParameter)}`;
    configuration.path = url;
  }
  return configuration;
}
