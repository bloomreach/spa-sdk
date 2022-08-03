/*
 * Copyright 2019 Bloomreach
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

import { destroy, initialize, Page, PageModel } from '@bloomreach/spa-sdk';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import React, { useEffect } from 'react';
import { mocked } from 'ts-jest/utils';
import { BrNode, BrProps } from '../component';
import { BrPage } from './BrPage';

jest.mock('@bloomreach/spa-sdk');

// eslint-disable-next-line react/prefer-stateless-function
class TestComponent extends React.Component<BrProps> {}

const config = {
  httpClient: jest.fn(),
  request: { path: '/' },
  options: {
    live: {
      cmsBaseUrl: 'http://localhost:8080/site/my-spa',
    },
    preview: {
      cmsBaseUrl: 'http://localhost:8080/site/_cmsinternal/my-spa',
    },
  },
};
const mapping = { TestComponent };

describe('BrPage', () => {
  const children = <div />;
  let wrapper: ShallowWrapper<React.ComponentProps<typeof BrPage>, { page?: Page }>;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = shallow(
      <BrPage configuration={config} mapping={mapping}>
        {children}
      </BrPage>,
    );
  });

  describe('componentDidMount', () => {
    it('should initialize the SPA SDK and sync the CMS', () => {
      expect(initialize).toHaveBeenCalledWith(config);

      const page = wrapper.state('page');
      expect(page).toBeDefined();
      expect(page!.sync).toHaveBeenCalled();
    });

    it('should use a page model from props', () => {
      mocked(initialize).mockClear();

      const page = {} as PageModel;
      shallow(<BrPage configuration={config} mapping={mapping} page={page} />);

      expect(initialize).toBeCalledWith(config, page);
    });
  });

  describe('componentDidUpdate', () => {
    let page: Page;

    beforeEach(() => {
      page = wrapper.state('page')!;
      wrapper = shallow(<BrPage configuration={config} mapping={mapping} page={page} />);

      mocked(initialize).mockClear();
    });

    it('should use a page instance from props when it is updated', () => {
      const newPage = { ...page } as Page;
      const configuration = { ...config };

      mocked(initialize as unknown as () => Page).mockReturnValueOnce(newPage);
      wrapper.setProps({ configuration, page: newPage });

      expect(wrapper.state('page')).toBe(newPage);
      expect(initialize).toBeCalledWith(configuration, newPage);
    });

    it('should initialize page on props update when page from props is not updated', () => {
      const configuration = { ...config };
      wrapper.setProps({ configuration });

      expect(destroy).toHaveBeenCalledWith(page);
      expect(initialize).toBeCalledWith(configuration);
      expect(page.sync).toHaveBeenCalled();
    });
  });

  describe('componentWillUnmount', () => {
    it('should destroy the page when unmounting', () => {
      const page = wrapper.state('page')!;

      wrapper.unmount();
      expect(destroy).toHaveBeenCalledWith(page);
    });

    it('should not destroy an empty page when unmounting', () => {
      wrapper.setState({ page: undefined });

      wrapper.unmount();
      expect(destroy).not.toHaveBeenCalled();
    });
  });

  describe('render', () => {
    it('should render children', () => {
      expect(wrapper.contains(children)).toBe(true);
    });

    it('should not render children if there is no page and NBR mode is false', () => {
      wrapper.setState({ page: undefined });
      wrapper.setProps({ configuration: { ...config, NBRMode: false } });

      expect(wrapper.contains(children)).toBe(false);
    });

    it('should render children if there is no page and NBR mode is true', () => {
      wrapper.setState({ page: undefined });
      wrapper.setProps({ configuration: { ...config, NBRMode: true } });

      expect(wrapper.contains(children)).toBe(true);
    });

    it('should run child component effects while retrieving Page model when NBR mode is true', () => {
      jest.useFakeTimers();

      const initializeDone = jest.fn();
      const someEffect = jest.fn();

      function MyComponent(): JSX.Element {
        useEffect(() => someEffect());
        return <></>;
      }

      const page = initialize(config);
      mocked(initialize).mockClear();
      mocked(initialize).mockImplementationOnce(() => {
        setTimeout(initializeDone, 1000);
        return page;
      });

      mount(
        <BrPage configuration={{ ...config, NBRMode: true }} mapping={mapping}>
          <MyComponent />
        </BrPage>,
      );

      jest.runAllTimers();
      const someEffectOrder = someEffect.mock.invocationCallOrder[0];
      const initializeDoneOrder = initializeDone.mock.invocationCallOrder[0];
      expect(someEffectOrder).toBeLessThan(initializeDoneOrder);

      jest.useRealTimers();
    });

    it('should mount children if there is no page and NBR mode is true', () => {});

    it('should keep children mounted as page becomes available if there is no page and NBR mode is true', () => {});

    it('should render BrPageContext.provider', () => {
      const page = wrapper.state('page')!;
      expect(wrapper.find('ContextProvider').first().prop('value')).toEqual(page);
    });

    it('should render BrMappingContext.provider', () => {
      expect(wrapper.find('ContextProvider').last().prop('value')).toEqual(mapping);
    });

    it('should render nothing if there is an error loading the page', async () => {
      const error = new Error('error-loading-page');
      mocked(initialize).mockRejectedValueOnce(error);

      const setState = jest.spyOn(BrPage.prototype, 'setState').mockImplementationOnce(() => {});

      mount(<BrPage configuration={config} mapping={mapping} />);
      await new Promise(process.nextTick);

      expect(setState).toHaveBeenCalledWith(expect.any(Function));
      expect(setState.mock.calls[0][0]).toThrowError(error);
    });

    it('should render root component', () => {
      const node = wrapper.find(BrNode);
      const root = wrapper.state('page')!.getComponent();

      expect(node.exists()).toBe(true);
      expect(node.prop('component')).toBe(root);
    });
  });
});
