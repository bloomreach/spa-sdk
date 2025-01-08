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

import type { Component, Container, Page } from '@bloomreach/spa-sdk';
import {
  TYPE_CONTAINER_BOX,
  TYPE_CONTAINER_INLINE,
  TYPE_CONTAINER_NO_MARKUP,
  TYPE_CONTAINER_ORDERED_LIST,
  TYPE_CONTAINER_UNORDERED_LIST,
} from '@bloomreach/spa-sdk';
import { shallowMount } from '@vue/test-utils';
import type { GlobalMountOptions } from '@vue/test-utils/dist/types';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import type { PropType } from 'vue';
import type { BrMapping } from '../../typings';
import BrNodeContainer from '../BrNodeContainer.vue';
import { component$, mapping$, page$ } from '../providerKeys';

describe('BrNodeContainer', () => {
  let component: Mocked<Container>;
  let mapping: BrMapping;
  let page: Mocked<Page>;
  let global: GlobalMountOptions;

  const SomeContainer = defineComponent({
    name: 'some-container',
    template: `
      <div class="some-container"/>
    `,
    props: {
      page: {
        type: Object as PropType<Page>,
      },
      component: {
        type: Object as PropType<Component>,
      },
    },
  });

  beforeEach(() => {
    component = {
      getType: vi.fn(),
    } as unknown as typeof component;
    mapping = {};
    page = {
      isPreview: vi.fn(),
    } as unknown as typeof page;

    global = {
      provide: {
        [page$ as symbol]: ref(page),
        [mapping$ as symbol]: mapping,
        [component$ as symbol]: ref(component),
      },
    };
  });

  describe('render', () => {
    it('should render a mapped container', async () => {
      component.getType.mockReturnValue('custom' as ReturnType<typeof component.getType>);
      mapping.custom = SomeContainer;

      const wrapper = shallowMount(BrNodeContainer, { global, slots: { default: ['<div />'] } });
      await nextTick();

      const props = wrapper.findComponent(SomeContainer).props();

      expect(wrapper.html()).toMatchSnapshot();
      expect(props.component).toEqual(component);
      expect(props.page).toEqual(page);
    });

    it.each`
      type
      ${TYPE_CONTAINER_BOX}
      ${TYPE_CONTAINER_INLINE}
      ${TYPE_CONTAINER_NO_MARKUP}
      ${TYPE_CONTAINER_ORDERED_LIST}
      ${TYPE_CONTAINER_UNORDERED_LIST}
    `('should render a container based on the type', async ({ type }) => {
      component.getType.mockReturnValue(type);

      const wrapper = shallowMount(BrNodeContainer, { global, slots: { default: ['<div />'] } });
      await nextTick();

      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
