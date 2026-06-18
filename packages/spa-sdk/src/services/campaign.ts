/*
 * Copyright 2021-2026 Bloomreach
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

import { getCookie, getCookieFromRequest } from './cookie';
import { HttpRequest } from '../spa/http';

export const CAMPAIGN_ID_COOKIE_KEY = '__br__campaign_id';
export const SEGMENT_COOKIE_KEY = '__br__segment';
export const TTL_COOKIE_KEY = '__br__ttl';

const DEFAULT_TTL_DAYS = 7;

function getCookieTTL(ttl: string | undefined): number {
  const days = Number(ttl);
  return Number.isNaN(days) ? DEFAULT_TTL_DAYS : days;
}

/**
 * Get the campaign variant id from URL parameters or cookie.
 * @param campaignId Campaign id from URL.
 * @param segmentId Segment id from URL.
 * @param ttl TTL parameter in days from URL.
 * @param request Current user's request.
 */
export function getCampaignVariantId(
  campaignId?: string,
  segmentId?: string,
  ttl?: string,
  request?: HttpRequest,
): string {
  if (getCookieTTL(ttl) === 0) {
    return '';
  }

  if (campaignId && segmentId) {
    return `${campaignId}:${segmentId}`;
  }

  const cookies = request?.headers ? getCookieFromRequest(request) : getCookie();
  const { [CAMPAIGN_ID_COOKIE_KEY]: _campaignId, [SEGMENT_COOKIE_KEY]: _segmentId } = cookies;

  if (_campaignId && _segmentId) {
    return `${_campaignId}:${_segmentId}`;
  }

  return '';
}
