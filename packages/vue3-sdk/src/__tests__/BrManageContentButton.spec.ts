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

import BrManageContentButton from '@/BrManageContentButton.vue';
import BrMeta from '@/BrMeta.vue';
import type { Content, MetaCollection, Page } from '@bloomreach/spa-sdk';
import { shallowMount } from '@vue/test-utils';
import type { GlobalMountOptions } from '@vue/test-utils/dist/types';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { page$ } from '../providerKeys';

describe('BrManageContentButton', () => {
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
    it('should render nothing when it is not a preview', async () => {
      page.isPreview.mockReturnValue(false);
      const wrapper = shallowMount(BrManageContentButton, { global });
      expect(wrapper.findComponent(BrMeta).exists()).toBe(false);
    });

    it('should render a content button meta', () => {
      page.isPreview.mockReturnValue(true);
      const content = {} as Content;
      const wrapper = shallowMount(BrManageContentButton, { global, props: { content, path: 'content' } });
      const props = wrapper.findComponent(BrMeta).props();

      expect(page.getButton).toBeCalledWith(expect.any(String), { content, path: 'content' });
      expect(props.meta).toBe(meta);
      expect(wrapper.findComponent(BrMeta).exists()).toBe(true);
    });
  });
});
