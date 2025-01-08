/*
 * Copyright 2020-2025 Bloomreach
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

import BrMeta from '../BrMeta.vue';
import type { MetaCollection } from '@bloomreach/spa-sdk';
import { shallowMount } from '@vue/test-utils';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

describe('BrMeta', () => {
  let meta: Mocked<MetaCollection>;

  beforeEach(() => {
    meta = {
      render: vi.fn(),
      length: 2
    } as unknown as typeof meta;
  });

  describe('render', () => {
    it('should surround multiple slots with span refs', async () => {
      const wrapper = shallowMount(BrMeta, {
        props: { meta },
        slots: { default: ['<div id="slot1" />', '<div id="slot2" />'] },
      });
      await nextTick();
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should surround a single slot with span refs', async () => {
      const wrapper = shallowMount(BrMeta, {
        props: { meta },
        slots: { default: '<div />' },
      });
      await nextTick();
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('beforeDestroy', () => {
    it('should clear previously rendered meta on destruction', async () => {
      const clear = vi.fn();
      meta.render.mockReturnValueOnce(clear);

      const wrapper = shallowMount(BrMeta, {
        props: { meta },
        slots: { default: '<div />' },
      });
      await nextTick();
      wrapper.unmount();

      expect(meta.render).toBeCalled();
      expect(clear).toBeCalled();
    });
  });

  describe('updated', () => {
    it('should render a new meta', async () => {
      const clear = vi.fn();
      meta.render.mockReturnValueOnce(clear);
      const wrapper = shallowMount(BrMeta, {
        props: { meta },
        slots: { default: '<div />' },
      });
      await nextTick();

      const updatedMeta = {
        ...meta,
        length: 3,
      };
      await wrapper.setProps({ meta: updatedMeta });
      await nextTick();

      expect(updatedMeta.render).toBeCalled();
      expect(clear).toBeCalled();
    });
  });
});
