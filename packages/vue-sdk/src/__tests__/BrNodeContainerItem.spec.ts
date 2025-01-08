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

import type { Component, ContainerItem, Page } from '@bloomreach/spa-sdk';
import { TYPE_CONTAINER_ITEM_UNDEFINED } from '@bloomreach/spa-sdk';
import { shallowMount } from '@vue/test-utils';
import type { GlobalMountOptions } from '@vue/test-utils/dist/types';
import type { Mocked } from 'vitest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { PropType, Ref } from 'vue';
import { defineComponent, nextTick, ref } from 'vue';
import type { BrMapping } from '../../typings';
import BrNodeContainerItem from '@/BrNodeContainerItem.vue';
import { component$, mapping$, page$ } from '../providerKeys';

describe('BrNodeContainerItem', () => {
  let component: Mocked<ContainerItem>;
  let componentRef: Ref<typeof component>;
  let mapping: BrMapping;
  let page: Mocked<Page>;

  let global: GlobalMountOptions;

  const SomeContainerItem = defineComponent({
    name: 'some-container-item',
    template: `
      <div class="some-container-item"/>
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

  beforeAll(() => {
    component = {
      getType: vi.fn(),
      on: vi.fn(),
    } as unknown as typeof component;
    componentRef = ref(component);
    mapping = { something: SomeContainerItem };
    page = { sync: vi.fn() } as unknown as typeof page;

    global = {
      provide: {
        [page$ as symbol]: ref(page),
        [mapping$ as symbol]: mapping,
        [component$ as symbol]: componentRef,
      },
    };
  });

  describe('render', () => {
    it('should render a mapped container item', async () => {
      component.getType.mockReturnValue('something');

      const wrapper = shallowMount(BrNodeContainerItem, { global });
      await nextTick();

      const props = wrapper.findComponent(SomeContainerItem).props();

      expect(wrapper.html()).toMatchSnapshot();
      expect(props.component).toEqual(component);
      expect(props.page).toEqual(page);
    });

    it('should render an undefined container item', async () => {
      component.getType.mockReturnValue('undefined');

      const wrapper = shallowMount(BrNodeContainerItem, { global });
      await nextTick();

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should override undefined container item', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapping[TYPE_CONTAINER_ITEM_UNDEFINED as any] = SomeContainerItem;
      component.getType.mockReturnValue('undefined');

      const wrapper = shallowMount(BrNodeContainerItem, { global });
      await nextTick();

      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('destroyed', () => {
    it('should unsubscribe from update event on component destroy', async () => {
      const unsubscribe = vi.fn();
      component.on.mockReturnValue(unsubscribe);

      const wrapper = shallowMount(BrNodeContainerItem, { global });
      await nextTick();
      wrapper.unmount();
      await nextTick();

      expect(unsubscribe).toBeCalled();
    });
  });

  describe('update', () => {
    it('should subscribe for update event', async () => {
      shallowMount(BrNodeContainerItem, { global });
      await nextTick();

      expect(component.on).toBeCalledWith('update', expect.any(Function));
    });

    it('should unsubscribe from update event on component change', async () => {
      const unsubscribe = vi.fn();
      component.on.mockReturnValue(unsubscribe);

      shallowMount(BrNodeContainerItem, { global });
      await nextTick();

      componentRef.value = { ...component };
      await nextTick();

      expect(unsubscribe).toBeCalled();
    });

    it('should sync page on update event', async () => {
      shallowMount(BrNodeContainerItem, { global });
      await nextTick();

      const [[, listener]] = component.on.mock.calls;
      listener({});

      expect(page.sync).toBeCalled();
    });
  });
});
