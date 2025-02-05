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

import type { Configuration } from '@bloomreach/spa-sdk';
import { extractSearchParams } from '@bloomreach/spa-sdk';

type BuildConfigurationOptions = {
  endpoint: string | (string | null)[];
  baseUrl: string;
};

type ConfigurationBuilder = Configuration & Partial<BuildConfigurationOptions>;

export function buildConfiguration(
    path: string,
    httpClient: Configuration['httpClient'],
    baseUrl: string,
    endpoint: string,
    hasMultiTenantSupport: boolean,
): Configuration {
  const configuration: Partial<ConfigurationBuilder> = {
    path,
  };
  configuration.baseUrl = baseUrl;
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
  configuration.httpClient = httpClient;
  return configuration as Configuration;
}
