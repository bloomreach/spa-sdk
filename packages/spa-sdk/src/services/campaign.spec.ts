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

import { getCampaignVariantId, CAMPAIGN_ID_COOKIE_KEY, SEGMENT_COOKIE_KEY } from './campaign';

describe('campaign', () => {
  afterEach(() => {
    document.cookie = `${CAMPAIGN_ID_COOKIE_KEY}=; Max-Age=0;`;
    document.cookie = `${SEGMENT_COOKIE_KEY}=; Max-Age=0;`;
  });

  it('should return an empty string', () => {
    expect(getCampaignVariantId()).toBe('');
    expect(getCampaignVariantId('001')).toBe('');
    expect(getCampaignVariantId(undefined, 'gold')).toBe('');
    expect(getCampaignVariantId('001', 'gold', '0')).toBe('');
  });

  it('should return CSR cookie', () => {
    document.cookie = `${CAMPAIGN_ID_COOKIE_KEY}=12345`;
    document.cookie = `${SEGMENT_COOKIE_KEY}=gold`;

    expect(getCampaignVariantId()).toBe('12345:gold');
  });

  it('should return SSR cookie', () => {
    const request = {
      headers: {
        cookie: `${CAMPAIGN_ID_COOKIE_KEY}=12345; ${SEGMENT_COOKIE_KEY}=silver`,
      },
    };

    expect(getCampaignVariantId(undefined, undefined, undefined, request)).toBe('12345:silver');
  });

  it('should return empty variant id if ttl is equal zero', () => {
    document.cookie = `${CAMPAIGN_ID_COOKIE_KEY}=12345`;
    document.cookie = `${SEGMENT_COOKIE_KEY}=gold`;

    expect(getCampaignVariantId(undefined, undefined, '0')).toBe('');
  });
});
