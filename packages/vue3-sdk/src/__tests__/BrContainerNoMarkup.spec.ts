/*
 * Copyright 2020-2023 Bloomreach
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

import BrContainerNoMarkup from '@/BrContainerNoMarkup.vue';
import type { Page } from '@bloomreach/spa-sdk';
import { mount } from '@vue/test-utils';
import type { GlobalMountOptions } from '@vue/test-utils/dist/types';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { page$ } from '../providerKeys';

describe('BrContainerNoMarkup', () => {
  let page: Mocked<Page>;
  let global: GlobalMountOptions;

  beforeEach(() => {
    page = { isPreview: vi.fn() } as unknown as typeof page;
    global = {
      provide: {
        [page$ as symbol]: ref(page),
      },
    };
  });

  describe('render', () => {
    it(`should render container's children`, async () => {
      const wrapper = mount(BrContainerNoMarkup, {
        global,
        slots: { default: ['<span id="child1" />', '<span id="child2" />'] },
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
