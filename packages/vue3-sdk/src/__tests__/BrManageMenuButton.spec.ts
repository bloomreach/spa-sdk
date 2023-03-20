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

import BrManageMenuButton from '@/BrManageMenuButton.vue';
import BrMeta from '@/BrMeta.vue';
import type { MetaCollection, Page } from '@bloomreach/spa-sdk';
import { shallowMount } from '@vue/test-utils';
import type { GlobalMountOptions } from '@vue/test-utils/dist/types';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { page$ } from '../providerKeys';

vi.mock('@bloomreach/spa-sdk');

describe('BrManageMenuButton', () => {
  const meta = {} as MetaCollection;
  let page: Mocked<Page>;
  let global: GlobalMountOptions;

  beforeEach(() => {
    page = {
      getButton: vi.fn(() => meta),
      isPreview: vi.fn(),
    } as unknown as typeof page;

    global = {
      provide: {
        [page$ as symbol]: ref(page),
      },
    };
  });

  describe('render', () => {
    it('should render nothing when it is not a preview', () => {
      const menu = {};
      const wrapper = shallowMount(BrManageMenuButton, { global, propsData: { menu } });

      expect(wrapper.findComponent(BrMeta).exists()).toBe(false);
    });

    it('should render a menu button meta', () => {
      page.isPreview.mockReturnValueOnce(true);
      const menu = {};
      const wrapper = shallowMount(BrManageMenuButton, { global, propsData: { menu } });
      const props = wrapper.findComponent(BrMeta).props();

      expect(props.meta).toBe(meta);
      expect(wrapper.findComponent(BrMeta).exists()).toBe(true);
    });
  });
});
