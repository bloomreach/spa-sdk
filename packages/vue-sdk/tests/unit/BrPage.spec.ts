/*
 * Copyright 2020-2022 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Configuration, destroy, initialize, Page, PageModel } from '@bloomreach/spa-sdk';
import { mount, shallowMount } from '@vue/test-utils';
import { mocked } from 'ts-jest/utils';
import { Component as VueComponent, Vue } from 'vue-property-decorator';
import BrPage from '@/BrPage.vue';

jest.mock('@bloomreach/spa-sdk');

describe('BrPage', () => {
  let page: jest.Mocked<Page>;

  beforeEach(() => {
    page = {
      getComponent: jest.fn(),
      sync: jest.fn(),
    } as unknown as typeof page;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  describe('update', () => {
    it('should render nothing if the page was not initialized and NBR mode is false', async () => {
      const configuration = {
        NBRMode: false,
      } as Configuration;
      const wrapper = shallowMount(BrPage, { propsData: { configuration } });
      await new Promise(process.nextTick);

      expect(wrapper.html()).toEqual('');
    });

    it('should render the children components if the page was not initialized and NBR mode is true', async () => {
      const configuration = {
        NBRMode: true,
      } as Configuration;
      const wrapper = shallowMount(BrPage, { propsData: { configuration } });
      await new Promise(process.nextTick);

      expect(wrapper.html()).not.toEqual('');
    });

    it('should run child component effects while retrieving Page model when NBR mode is true', () => {
      jest.useFakeTimers();

      const initializeDone = jest.fn();
      const someEffect = jest.fn();

      mocked(initialize).mockClear();
      mocked(initialize).mockImplementationOnce(async () => {
        setTimeout(initializeDone, 1000);
        return page;
      });

      const configuration = {
        NBRMode: true,
      } as Configuration;

      const MyComponent = {
        mounted() {
          someEffect();
        },
        template: '<div>Hello world</div>',
      };

      @VueComponent({
        name: 'wrapper-component',
        components: { BrPage, MyComponent },
        data() {
          return {
            configuration,
            mapping: {},
          };
        },
        template: `
          <br-page :configuration="configuration" :mapping="mapping">
          <template v-slot:default="props">
            <my-component></my-component>
          </template>
          </br-page>
        `,
      })
      class WrapperComponent extends Vue {}

      mount(WrapperComponent);

      jest.runAllTimers();
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
      mocked(initialize).mockResolvedValueOnce(page);

      const wrapper = shallowMount(BrPage, { propsData: { configuration } });
      await new Promise(process.nextTick);

      const nodeComponent = wrapper.findComponent({ name: 'br-node-component' });

      expect(initialize).toBeCalledWith(configuration);
      expect(nodeComponent.props()).toEqual({ component });
    });

    it('should initialize a prefetched model', async () => {
      const configuration = {} as Configuration;
      const model = {} as PageModel;
      mocked(initialize as unknown as () => Page).mockReturnValueOnce(page);

      shallowMount(BrPage, { propsData: { configuration, page: model } });
      await new Promise(process.nextTick);

      expect(initialize).toBeCalledWith(configuration, model);
    });

    it('should initialize a page on configuration change', async () => {
      const configuration = { request: { path: 'a' } } as Configuration;
      mocked(initialize).mockResolvedValueOnce(page);

      const wrapper = shallowMount(BrPage, { propsData: { configuration } });
      await new Promise(process.nextTick);

      wrapper.setProps({ configuration: { request: { path: 'b' } } });
      await new Promise(process.nextTick);

      expect(initialize).toBeCalledWith({ request: { path: 'b' } });
    });

    it('should destroy previously initialized page', async () => {
      const configuration = {} as Configuration;
      mocked(initialize).mockResolvedValueOnce(page);

      const wrapper = shallowMount(BrPage, { propsData: { configuration } });
      await new Promise(process.nextTick);

      wrapper.setProps({ configuration: { request: { path: 'b' } } });
      await new Promise(process.nextTick);

      expect(destroy).toBeCalledWith(page);
    });
  });

  describe('destroyed', () => {
    it('should destroy a page upon component destruction', async () => {
      mocked(initialize as unknown as () => Page).mockReturnValueOnce(page);

      const wrapper = shallowMount(BrPage, { propsData: { configuration: {}, page } });
      await wrapper.vm.$nextTick();
      wrapper.destroy();

      expect(destroy).toBeCalledWith(page);
    });
  });

  describe('mounted', () => {
    it('should sync a page on mount', async () => {
      mocked(initialize).mockResolvedValueOnce(page);

      const wrapper = shallowMount(BrPage, { propsData: { configuration: {}, page } });
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(page.sync).toBeCalled();
    });
  });

  describe('updated', () => {
    it('should sync a page on update', async () => {
      const wrapper = shallowMount(BrPage, { propsData: { configuration: {} } });
      await new Promise(process.nextTick);

      mocked(initialize).mockResolvedValue(page);
      wrapper.setProps({ configuration: {} });
      await new Promise(process.nextTick);

      expect(page.sync).toBeCalled();
    });
  });
});
