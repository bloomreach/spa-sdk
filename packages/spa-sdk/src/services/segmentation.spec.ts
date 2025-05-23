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

import { Segmentation } from './segmentation';

describe('campaign', () => {
  afterEach(() => {
    document.cookie = `${Segmentation.SEGMENT_IDS_PARAMETER}=;`;
  });

  it('should return an empty string', () => {
    expect(Segmentation.GET_SEGMENT_IDS()).toBe('');
  });

  it('should return CSR cookie', () => {
    document.cookie = `${Segmentation.SEGMENT_IDS_PARAMETER}=12345`;

    expect(Segmentation.GET_SEGMENT_IDS()).toBe('12345');
  });

  it('should return SSR cookie', () => {
    const request = {
      headers: {
        cookie: `${Segmentation.SEGMENT_IDS_PARAMETER}=12345`,
      },
    };

    expect(Segmentation.GET_SEGMENT_IDS(request)).toBe('12345');
  });

  it('should return empty string if SSR cookie is absent', () => {
    const request = {};

    expect(Segmentation.GET_SEGMENT_IDS(request)).toBe('');
  });
});
