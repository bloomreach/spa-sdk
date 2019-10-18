/*
 * Copyright 2019 Hippo B.V. (http://www.onehippo.com)
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

import { isPreview } from './preview';

describe('isPreview', () => {
  it('should use a parameter name', () => {
    expect(isPreview({ path: '/some?a' }, 'a')).toBe(true);
    expect(isPreview({ path: '/some?b=1&a' }, 'a')).toBe(true);
    expect(isPreview({ path: '/some?b=1&a=2' }, 'a')).toBe(true);
    expect(isPreview({ path: '/some?b=1' }, 'a')).toBe(false);
  });

  it('should use a parameter value', () => {
    expect(isPreview({ path: '/some?a' }, 'a=2')).toBe(false);
    expect(isPreview({ path: '/some?a=1' }, 'a=2')).toBe(false);
    expect(isPreview({ path: '/some?a=2' }, 'a=2')).toBe(true);
  });

  it('should not fail when there is no query string', () => {
    expect(isPreview({ path: '' }, 'a')).toBe(false);
    expect(isPreview({ path: '/some' }, 'a')).toBe(false);
  });
});
