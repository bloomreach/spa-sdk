/*
 * Copyright 2021-2025 Bloomreach
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

import { Campaign } from './campaign';

describe('campaign', () => {
  afterEach(() => {
    document.cookie = `${Campaign.CAMPAIGN_PARAMETER}=; Max-Age=0;`;
    document.cookie = `${Campaign.SEGMENT_PARAMETER}=; Max-Age=0;`;
    document.cookie = `${Campaign.TTL_PARAMETER}=; Max-Age=0;`;
  });

  it('should return an empty string', () => {
    expect(Campaign.GET_VARIANT_ID()).toBe('');
    expect(Campaign.GET_VARIANT_ID('001')).toBe('');
    expect(Campaign.GET_VARIANT_ID(undefined, 'gold')).toBe('');
    expect(Campaign.GET_VARIANT_ID('001', 'gold', '0')).toBe('');
  });

  it('should return CSR cookie', () => {
    document.cookie = `${Campaign.CAMPAIGN_PARAMETER}=12345`;
    document.cookie = `${Campaign.SEGMENT_PARAMETER}=gold`;

    expect(Campaign.GET_VARIANT_ID()).toBe('12345:gold');
  });

  it('should return SSR cookie', () => {
    const request = {
      headers: {
        cookie: `${Campaign.CAMPAIGN_PARAMETER}=12345; ${Campaign.SEGMENT_PARAMETER}=silver`,
      },
    };

    expect(Campaign.GET_VARIANT_ID(undefined, undefined, undefined, request)).toBe('12345:silver');
  });

  it('should return empty varian id if ttl is equal zero', () => {
    document.cookie = `${Campaign.CAMPAIGN_PARAMETER}=12345`;
    document.cookie = `${Campaign.SEGMENT_PARAMETER}=gold`;

    expect(Campaign.GET_VARIANT_ID(undefined, undefined, '0')).toBe('');
  });
});
