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

import BrPage from '@/BrPage.vue';
import type { Component, Configuration, Page, PageModel } from '@bloomreach/spa-sdk';
import { destroy, initialize } from '@bloomreach/spa-sdk';
import { mount, shallowMount } from '@vue/test-utils';
import type { Mocked } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import type { BrMapping } from '../../typings';

vi.mock('@bloomreach/spa-sdk');

describe('BrPage', () => {
  let page: Mocked<Page>;

  describe('update', () => {
    beforeEach(() => {
      page = {
        getComponent: vi.fn(),
        sync: vi.fn(),
      } as unknown as Mocked<Page>;
    });

    it('should render nothing if the page was not initialized and NBR mode is false', async () => {
      const configuration = {
        NBRMode: false,
      } as Configuration;
      const wrapper = shallowMount(BrPage, { props: { configuration, mapping: {} as BrMapping } });

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render the children components if the page was not initialized and NBR mode is true', async () => {
      const configuration = {
        NBRMode: true,
      } as Configuration;
      const wrapper = shallowMount(BrPage, { props: { configuration, mapping: {} as BrMapping } });

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should run child component effects while retrieving Page model when NBR mode is true', () => {
      vi.useFakeTimers();

      const initializeDone = vi.fn();
      const someEffect = vi.fn();

      vi.mocked(initialize).mockClear();
      vi.mocked(initialize).mockImplementationOnce(async () => {
        setTimeout(initializeDone, 1000);
        return page;
      });

      const configuration = {
        NBRMode: true,
      } as Configuration;

      const MyComponent = defineComponent({
        mounted() {
          someEffect();
        },
        template: '<div>Hello world</div>',
      });

      const WrapperComponent = defineComponent({
        name: 'wrapper-component',
        components: { BrPage, MyComponent },
        data() {
          return {
            configuration,
            mapping: {} as BrMapping,
          };
        },
        template: `
          <br-page :configuration="configuration" :mapping="mapping">
          <template v-slot:default="props">
            <my-component></my-component>
          </template>
          </br-page>
        `,
      });

      mount(WrapperComponent);

      vi.runAllTimers();
      const someEffectOrder = someEffect.mock.invocationCallOrder[0];
      const initializeDoneOrder = initializeDone.mock.invocationCallOrder[0];

      expect(someEffect).toHaveBeenCalled();
      expect(initializeDone).toHaveBeenCalled();
      expect(someEffectOrder).toBeLessThan(initializeDoneOrder);
    });

    it('should fetch a page model', async () => {
      const component = {} as Component;
      const configuration = {} as Configuration;
      page.getComponent.mockReturnValue(component);
      vi.mocked(initialize).mockResolvedValueOnce(page);

      const wrapper = shallowMount(BrPage, { props: { configuration, mapping: {} as BrMapping } });
      await new Promise(process.nextTick);
      const nodeComponent = wrapper.findComponent({ name: 'br-node-component' });

      expect(initialize).toBeCalledWith(configuration);
      expect(nodeComponent.props()).toEqual({ component });
    });

    it('should initialize a prefetched model', async () => {
      const configuration = {} as Configuration;
      const model = {} as PageModel;
      vi.mocked(initialize as unknown as () => Page).mockReturnValueOnce(page);

      shallowMount(BrPage, { props: { configuration, page: model, mapping: {} as BrMapping } });

      expect(initialize).toBeCalledWith(configuration, model);
    });

    it('should initialize a page on configuration change', async () => {
      const configuration = { request: { path: 'a' } } as Configuration;
      vi.mocked(initialize).mockResolvedValueOnce(page);

      const wrapper = shallowMount(BrPage, { props: { configuration, mapping: {} as BrMapping } });
      await new Promise(process.nextTick);

      await wrapper.setProps({ configuration: { request: { path: 'b' } }, mapping: {} as BrMapping });
      await new Promise(process.nextTick);

      expect(initialize).toBeCalledWith({ request: { path: 'b' } });
    });

    it('should destroy previously initialized page', async () => {
      const configuration = {} as Configuration;
      vi.mocked(initialize).mockResolvedValueOnce(page);

      const wrapper = shallowMount(BrPage, { props: { configuration, mapping: {} as BrMapping } });
      await new Promise(process.nextTick);

      await wrapper.setProps({ configuration: { request: { path: 'b' }, mapping: {} as BrMapping } });
      await new Promise(process.nextTick);

      expect(destroy).toBeCalledWith(page);
    });
  });

  describe('destroyed', () => {
    it('should destroy a page upon component destruction', async () => {
      vi.mocked(initialize as unknown as () => Page).mockReturnValueOnce(page);

      const wrapper = shallowMount(BrPage, { props: { configuration: {} as Configuration, mapping: {} as BrMapping } });
      await wrapper.vm.$nextTick();
      wrapper.unmount();

      expect(destroy).toBeCalledWith(page);
    });
  });

  describe('mounted', () => {
    it('should sync a page on mount', async () => {
      vi.mocked(initialize).mockResolvedValueOnce(page);

      const wrapper = shallowMount(BrPage, { props: { configuration: {} as Configuration, mapping: {} as BrMapping } });
      await wrapper.vm.$nextTick();

      expect(page.sync).toBeCalled();
    });
  });

  describe('updated', () => {
    it('should sync a page on update', async () => {
      const wrapper = shallowMount(BrPage, { props: { configuration: {} as Configuration, mapping: {} as BrMapping } });
      await new Promise(process.nextTick);

      vi.mocked(initialize).mockResolvedValue(page);
      await wrapper.setProps({ configuration: {} });
      await new Promise(process.nextTick);

      expect(page.sync).toBeCalled();
    });
  });
});
