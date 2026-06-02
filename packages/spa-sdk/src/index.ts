/*
 * Copyright 2019-2026 Bloomreach
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

/**
 * Main entry point of the spa-sdk library.
 * @module index
 */

import { SdkRuntime } from './container';
import { Configuration } from './configuration';
import { Level, Logger } from './logger';
import { isPage, Page, PageModel } from './page';
import { Campaign } from './services/campaign';
import { Segmentation } from './services/segmentation';
import { appendSearchParams, extractSearchParams, parseUrl } from './url';

const runtime = new SdkRuntime();

const DEFAULT_AUTHORIZATION_PARAMETER = 'token';
const DEFAULT_SERVER_ID_PARAMETER = 'server-id';

const BTM_PREFIX = 'btm_';
const DEFAULT_CAMPAIGN_VARIANT_PARAMETER_URL = `${BTM_PREFIX}campaign_id`;
const DEFAULT_SEGMENT_PARAMETER_URL = `${BTM_PREFIX}segment`;
const DEFAULT_TTL_PARAMETER_URL = `${BTM_PREFIX}ttl`;

const BR_PREFIX = '__br__';
const DEFAULT_CAMPAIGN_VARIANT_PARAMETER_API = `${BR_PREFIX}campaignVariant`;
const DEFAULT_SEGMENT_IDS_PARAMETER_API = `${BR_PREFIX}segmentIds`;

function onReady<T>(value: T | Promise<T>, callback: (cbValue: T) => unknown): T | Promise<T> {
  // eslint-disable-next-line no-sequences
  const wrapper = (result: T): T => (callback(result), result);

  return value instanceof Promise ? value.then(wrapper) : wrapper(value);
}

interface ParsedRequest {
  path: string;
  searchParams: URLSearchParams;
  authorizationToken?: string;
  serverId?: string;
  campaignId?: string;
  segmentId?: string;
  ttl?: string;
  campaignVariantId?: string;
  segmentIds?: string;
}

type ResolvedConfig = Configuration & {
  endpoint: string;
  baseUrl: string;
  origin: string;
  NBRMode: boolean;
};

function parseRequest(configuration: Configuration): ParsedRequest {
  const authorizationParameter = configuration.authorizationQueryParameter ?? DEFAULT_AUTHORIZATION_PARAMETER;
  const serverIdParameter = configuration.serverIdQueryParameter ?? DEFAULT_SERVER_ID_PARAMETER;

  const { url: path, searchParams } = extractSearchParams(
    configuration.path ?? configuration.request?.path ?? '/',
    [
      authorizationParameter,
      serverIdParameter,
      DEFAULT_CAMPAIGN_VARIANT_PARAMETER_URL,
      DEFAULT_SEGMENT_PARAMETER_URL,
      DEFAULT_TTL_PARAMETER_URL,
    ].filter(Boolean),
  );

  const campaignId = searchParams.get(DEFAULT_CAMPAIGN_VARIANT_PARAMETER_URL) ?? undefined;
  const segmentId = searchParams.get(DEFAULT_SEGMENT_PARAMETER_URL) ?? undefined;
  const ttl = searchParams.get(DEFAULT_TTL_PARAMETER_URL) ?? undefined;

  return {
    path,
    searchParams,
    authorizationToken: searchParams.get(authorizationParameter) ?? undefined,
    serverId: searchParams.get(serverIdParameter) ?? undefined,
    campaignId,
    segmentId,
    ttl,
    campaignVariantId: Campaign.GET_VARIANT_ID(campaignId, segmentId, ttl, configuration.request),
    segmentIds: Segmentation.GET_SEGMENT_IDS(configuration.request),
  };
}

function resolveConfig(configuration: Configuration, parsed: ParsedRequest): ResolvedConfig {
  const apiParams = new URLSearchParams();
  if (parsed.campaignVariantId) {
    apiParams.append(DEFAULT_CAMPAIGN_VARIANT_PARAMETER_API, parsed.campaignVariantId);
  }
  if (parsed.segmentIds) {
    apiParams.append(DEFAULT_SEGMENT_IDS_PARAMETER_API, parsed.segmentIds);
  }
  if (configuration.refPrefix) {
    apiParams.append('refPrefix', configuration.refPrefix);
  }

  return {
    ...configuration,
    endpoint: appendSearchParams(configuration.endpoint ?? '', apiParams),
    baseUrl: appendSearchParams(configuration.baseUrl ?? '', parsed.searchParams),
    origin: configuration.origin ?? parseUrl(configuration.endpoint ?? '').origin,
    NBRMode: configuration.NBRMode || false,
  };
}

function logBootInfo(logger: Logger, parsed: ParsedRequest, resolved: ResolvedConfig): void {
  const debugFields: Array<[string, string | undefined]> = [
    ['Token', parsed.authorizationToken],
    ['Server Id', parsed.serverId],
    ['Campaign Id', parsed.campaignId],
    ['Segment Id', parsed.segmentId],
    ['TTL', parsed.ttl],
    ['Campaign variant Id', parsed.campaignVariantId],
  ];
  debugFields.forEach(([label, value]) => value && logger.debug(`${label}:`, value));

  logger.debug('Endpoint:', resolved.endpoint);
  logger.debug('Origin:', resolved.origin);
  logger.debug('Path:', parsed.path);
  logger.debug('Base URL:', resolved.baseUrl);
}

function bootSpa(
  parsed: ParsedRequest,
  resolved: ResolvedConfig,
  model: PageModel | undefined,
  logger: Logger,
): Page | Promise<Page> {
  const spa = runtime.createScope(
    { authorizationToken: parsed.authorizationToken, serverId: parsed.serverId, ...resolved },
    resolved,
  );

  return onReady(spa.initialize(model ?? parsed.path), (page) => {
    if (page.isPreview() && resolved.endpoint) {
      logger.info('Running in preview mode.');
      runtime.initializePreview(resolved);
    } else {
      logger.info('Running in live mode.');
    }
  });
}

/**
 * Initializes the page model.
 *
 * @param configuration Configuration of the SPA integration with brXM.
 * @param model Preloaded page model.
 */
export function initialize(configuration: Configuration, model: Page | PageModel): Page;

/**
 * Initializes the page model.
 *
 * @param configuration Configuration of the SPA integration with brXM.
 * @param [model] Preloaded page model.
 */
export async function initialize(configuration: Configuration): Promise<Page>;

export function initialize(configuration: Configuration, model?: Page | PageModel): Page | Promise<Page> {
  if (isPage(model)) {
    return model;
  }

  runtime.destroyScope();

  const logger = runtime.getLogger();
  logger.level = configuration.debug ? Level.Debug : Level.Error;
  logger.debug('Configuration:', configuration);
  logger.info('Enabled token-based setup.');

  const parsed = parseRequest(configuration);
  const resolved = resolveConfig(configuration, parsed);
  logBootInfo(logger, parsed, resolved);

  return onReady(bootSpa(parsed, resolved, model, logger), (page) => {
    configuration.request?.emit?.('br:spa:initialized', page);
  });
}

/**
 * Destroys the integration with the SPA page.
 */
export function destroy(): void {
  runtime.destroyScope();
}

export { Configuration } from './configuration';
export type { HttpClient, HttpClientConfig, HttpResponse, HttpHeaders } from './spa/http';
export {
  Component,
  ContainerItem,
  Container,
  Document,
  ImageSet,
  Image,
  Link,
  ManageContentButton,
  MenuItem,
  Menu,
  MetaCollection,
  MetaComment,
  Meta,
  PageModel,
  Page,
  PaginationItem,
  Pagination,
  Reference,
  getContainerItemContent,
  isComponent,
  isContainerItem,
  isContainer,
  isDocument,
  isImageSet,
  isLink,
  isMenu,
  isMetaComment,
  isMeta,
  isPage,
  isPagination,
  isReference,
  META_POSITION_BEGIN,
  META_POSITION_END,
  TYPE_CONTAINER_BOX,
  TYPE_CONTAINER_INLINE,
  TYPE_CONTAINER_NO_MARKUP,
  TYPE_CONTAINER_ORDERED_LIST,
  TYPE_CONTAINER_UNORDERED_LIST,
  TYPE_CONTAINER_ITEM_UNDEFINED,
  TYPE_LINK_EXTERNAL,
  TYPE_LINK_INTERNAL,
  TYPE_LINK_RESOURCE,
  TYPE_MANAGE_CONTENT_BUTTON,
  TYPE_MANAGE_MENU_BUTTON,
} from './page';
export { extractSearchParams } from './url/utils';
