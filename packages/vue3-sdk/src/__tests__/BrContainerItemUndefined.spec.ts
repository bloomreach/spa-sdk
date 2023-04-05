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

import BrContainerItemUndefined from '@/BrContainerItemUndefined.vue';
import type { ContainerItem } from '@bloomreach/spa-sdk';
import { shallowMount } from '@vue/test-utils';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('BrContainerItemUndefined', () => {
  let component: Mocked<ContainerItem>;

  beforeEach(() => {
    component = { getType: vi.fn(() => 'Some Component') } as unknown as typeof component;
  });

  describe('render', () => {
    it(`should render an undefined container item`, async () => {
      const wrapper = shallowMount(BrContainerItemUndefined, { props: { component } });
      await wrapper.vm.$nextTick();
      const fragment = wrapper.findComponent({ name: 'br-container-item-undefined' });

      expect(fragment.element.innerHTML).toMatchSnapshot();
    });
  });
});
