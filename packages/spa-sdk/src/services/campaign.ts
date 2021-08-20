/*
 * Copyright 2021 Hippo B.V. (http://www.onehippo.com)
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

import { Cookie } from './cookie';
import { HttpRequest } from '../spa/http';

export class Campaign {
  static readonly CAMPAIGN_PARAMETER = 'btm_campaign_id';

  static readonly SEGMENT_PARAMETER = 'btm_segment';

  static readonly TTL_PARAMETER = 'btm_ttl';

  static readonly DEFAULT_TTL_DAYS = 7;

  /**
   * Get the campaign variant from URL or cookie
   * @param campaignId Campaign id from URL
   * @param segmentId Segment id from URL
   * @param ttl TTL param in days from URL
   * @param request Current user's request
   * @return string
   */
  public static GET_VARIANT_ID(campaignId?: string, segmentId?: string, ttl?: string, request?: HttpRequest): string {
    const TTL = this.getCookieTTL(ttl);

    if (TTL === 0) {
      Cookie.ERASE_COOKIE(this.CAMPAIGN_PARAMETER);
      Cookie.ERASE_COOKIE(this.SEGMENT_PARAMETER);
      return '';
    }

    if (campaignId && segmentId) {
      Cookie.SET_COOKIE(this.CAMPAIGN_PARAMETER, campaignId, TTL);
      Cookie.SET_COOKIE(this.SEGMENT_PARAMETER, segmentId, TTL);
      return `${campaignId}:${segmentId}`;
    }

    const { [this.CAMPAIGN_PARAMETER]: _campaignId, [this.SEGMENT_PARAMETER]: _segmentId } = request?.headers
      ? Cookie.GET_COOKIE_FROM_REQUEST(request)
      : Cookie.GET_COOKIE();

    if (_campaignId && _segmentId) {
      return `${_campaignId}:${_segmentId}`;
    }

    return '';
  }

  /**
   * Get cookie TTL value
   * @param ttl TTL param in days
   * @return number
   */
  private static getCookieTTL(ttl: string | undefined): number {
    const TTL = Number(ttl);
    return Number.isNaN(TTL) ? this.DEFAULT_TTL_DAYS : TTL;
  }
}
