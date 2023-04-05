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

import BrComponent from '@/BrComponent.vue';
import BrNodeComponent from '@/BrNodeComponent.vue';
import type { Component, Page } from '@bloomreach/spa-sdk';
import { isComponent } from '@bloomreach/spa-sdk';
import { shallowMount } from '@vue/test-utils';
import type { GlobalMountOptions } from '@vue/test-utils/dist/types';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { component$, page$ } from '../providerKeys';

vi.mock('@bloomreach/spa-sdk');

describe('BrComponent', () => {
  let parent: Mocked<Component>;
  let page: Mocked<Page>;
  let global: GlobalMountOptions;

  beforeEach(() => {
    parent = {
      getChildren: vi.fn(() => []),
      getComponent: vi.fn(),
    } as unknown as typeof parent;
    page = { sync: vi.fn() } as unknown as typeof page;
    global = {
      provide: {
        [component$ as symbol]: ref(parent),
        [page$ as symbol]: ref(page),
      },
    };
  });

  describe('render', () => {
    it('should render a single component', () => {
      vi.mocked(isComponent).mockReturnValueOnce(true);
      const component = 'some component';
      const wrapper = shallowMount(BrComponent, {
        global,
        props: { component },
      });
      const props = wrapper.findComponent(BrNodeComponent).props();

      expect(wrapper.html()).toMatchSnapshot();
      expect(props.component).toStrictEqual(component);
    });

    it('should render children if the component prop is omitted', () => {
      const child1 = {} as Component;
      const child2 = {} as Component;
      parent.getChildren.mockReturnValueOnce([child1, child2]);
      const wrapper = shallowMount(BrComponent, {
        global,
      });
      const children = wrapper.findAllComponents(BrNodeComponent);

      expect(children.at(0)?.props().component).toBe(child1);
      expect(children.at(1)?.props().component).toBe(child2);
    });

    it('should render a component by path', () => {
      const component = {} as Component;
      parent.getComponent.mockReturnValueOnce(component);
      const wrapper = shallowMount(BrComponent, {
        global,
        props: { component: 'a/b' },
      });
      const props = wrapper.findComponent(BrNodeComponent).props();

      expect(parent.getComponent).toBeCalledWith('a', 'b');
      expect(props.component).toBe(component);
    });

    it('should render nothing if no component found', () => {
      const wrapper = shallowMount(BrComponent, {
        global,
        props: { component: 'a/b' },
      });

      expect(wrapper.html()).toBe('');
    });
  });
});
