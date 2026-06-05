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

import { getSegmentIds, SEGMENT_IDS_COOKIE_KEY } from './segmentation';

describe('segmentation', () => {
  afterEach(() => {
    document.cookie = `${SEGMENT_IDS_COOKIE_KEY}=;`;
  });

  it('should return an empty string', () => {
    expect(getSegmentIds()).toBe('');
  });

  it('should return CSR cookie', () => {
    document.cookie = `${SEGMENT_IDS_COOKIE_KEY}=12345`;

    expect(getSegmentIds()).toBe('12345');
  });

  it('should return SSR cookie', () => {
    const request = {
      headers: {
        cookie: `${SEGMENT_IDS_COOKIE_KEY}=12345`,
      },
    };

    expect(getSegmentIds(request)).toBe('12345');
  });

  it('should return empty string if SSR cookie is absent', () => {
    const request = {};

    expect(getSegmentIds(request)).toBe('');
  });
});
