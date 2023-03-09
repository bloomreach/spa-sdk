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

import type { Component, MetaCollection, Page } from '@bloomreach/spa-sdk';
import { isContainer, isContainerItem } from '@bloomreach/spa-sdk';
import { shallowMount } from '@vue/test-utils';
import type { GlobalMountOptions } from '@vue/test-utils/dist/types';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, PropType, Ref, ref } from 'vue';
import type { BrMapping } from '../../typings';
import BrNodeComponent from '../BrNodeComponent.vue';
import BrNodeContainerItem from '../BrNodeContainerItem.vue';
import { mapping$, page$ } from '../providerKeys';

vi.mock('@bloomreach/spa-sdk');

describe('BrNodeComponent', () => {
  let component: Mocked<Component>;
  let mapping: Ref<BrMapping>;
  let page: Mocked<Page>;
  let global: GlobalMountOptions;

  const someComponentName = 'something';
  const SomeComponent = defineComponent({
    name: someComponentName,
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
      getChildren: vi.fn(() => []),
      getMeta: vi.fn(),
      getName: vi.fn(() => someComponentName),
      getType: vi.fn(),
    } as unknown as typeof component;
    mapping = ref({ something: SomeComponent });
    page = {
      isPreview: vi.fn(),
    } as unknown as typeof page;

    global = {
      // Render out default slot fallback content
      renderStubDefaultSlot: true,
      provide: {
        [page$ as symbol]: ref(page),
        [mapping$ as symbol]: mapping,
      },
    };
  });

  describe('render', () => {
    it('should surround the component with meta-data', () => {
      component.getMeta.mockReturnValue(['a', 'b'] as unknown as MetaCollection);
      const wrapper = shallowMount(BrNodeComponent, { global, props: { component } });
      const metaComponent = wrapper.findComponent({ name: 'br-meta' });

      expect(metaComponent.exists()).toEqual(true);
    });

    it('should render a container item', async () => {
      vi.mocked(isContainerItem).mockReturnValueOnce(true);

      const wrapper = shallowMount(BrNodeComponent, { global, props: { component } });
      await nextTick();

      expect(wrapper.findComponent(BrNodeContainerItem).exists()).toBe(true);
    });

    it('should render a container', async () => {
      const child1 = { getName: () => 'child1', getId: () => 'child1' } as unknown as Component;
      const child2 = { getName: () => 'child2', getId: () => 'child2' } as unknown as Component;
      component.getChildren.mockReturnValue([child1, child2]);
      vi.mocked(isContainer).mockReturnValueOnce(true);

      const wrapper = shallowMount(BrNodeComponent, { global, props: { component } });
      await nextTick();

      const container = wrapper.findComponent({ name: 'br-node-container' });
      expect(container.exists()).toBe(true);
      const children = container.findAllComponents({ name: 'br-node-component' });
      expect(children.at(0)?.props().component.getName()).toBe('child1');
      expect(children.at(1)?.props().component.getName()).toBe('child2');
    });

    it('should render a mapped component', async () => {
      component.getName.mockReturnValue('something');

      const wrapper = shallowMount(BrNodeComponent, { global, props: { component } });
      await nextTick();

      const props = wrapper.findComponent(SomeComponent).props();

      expect(wrapper.html()).toMatchSnapshot();
      expect(props.component).toEqual(component);
      expect(props.page).toEqual(page);
    });

    it('should render children', async () => {
      const child1 = { getName: () => 'child1', getId: () => 'child1' } as unknown as Component;
      const child2 = { getName: () => 'child2', getId: () => 'child2' } as unknown as Component;
      component.getChildren.mockReturnValue([child1, child2]);

      mapping.value = {};
      const wrapper = shallowMount(BrNodeComponent, { global, props: { component } });
      await nextTick();

      const children = wrapper.findAllComponents({ name: 'br-node-component' });
      expect(wrapper.html()).toMatchSnapshot();
      expect(children.at(0)?.props().component.getName()).toBe('child1');
      expect(children.at(1)?.props().component.getName()).toBe('child2');
    });
  });
});
