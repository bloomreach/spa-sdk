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

import { shallowMount } from '@vue/test-utils';
import { Component, Prop, Provide, Vue } from 'vue-property-decorator';
import { MetaCollection, Page } from '@bloomreach/spa-sdk';
import BrManageContentButton from '@/BrManageContentButton.vue';
import BrMeta from '@/BrMeta.vue';

@Component({ template: '<div />' })
class BrPage extends Vue {
  @Prop() page!: Page;

  @Provide() page$() {
    return this.page;
  }
}

describe('BrManageContentButton', () => {
  const meta = {} as MetaCollection;
  let page: jest.Mocked<Page>;
  let provide: () => unknown;

  beforeAll(() => {
    page = {
      getButton: jest.fn(() => meta),
      isPreview: jest.fn(),
    } as unknown as typeof page;

    const wrapper = shallowMount(BrPage, { propsData: { page } });
    provide = (wrapper.vm.$options.provide as typeof provide).bind(wrapper.vm);
  });

  describe('render', () => {
    it('should render nothing when it is not a preview', () => {
      const wrapper = shallowMount(BrManageContentButton, { provide, propsData: {} });

      expect(wrapper.html()).toBe('');
    });

    it('should render a content button meta', () => {
      page.isPreview.mockReturnValueOnce(true);
      const content = {};
      const wrapper = shallowMount(BrManageContentButton, { provide, propsData: { content, path: 'content' } });
      const props = wrapper.findComponent(BrMeta).props();

      expect(page.getButton).toBeCalledWith(expect.any(String), { content, path: 'content' });
      expect(props.meta).toBe(meta);
    });
  });
});
