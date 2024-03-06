/*
 * Copyright 2019-2023 Bloomreach
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

import React, { useEffect } from 'react';
import { destroy, initialize, Page, PageModel } from '@bloomreach/spa-sdk';
import { act, render, RenderResult } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';

import { BrProps } from '../component';
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

const page = {
  isPreview: jest.fn(),
  getButton: jest.fn(),
  getComponent: () => ({
    getName: jest.fn(),
    getChildren: jest.fn(() => []),
    getMeta: jest.fn(),
  }),
  sync: jest.fn(),
} as unknown as Page;
const mapping = { TestComponent };

describe('BrPage', () => {
  const children = <div />;
  let element: RenderResult;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mocked(initialize).mockResolvedValue(page);

    await act(async () => {
      element = render(<BrPage configuration={config} mapping={mapping} />);
    });
  });

  describe('componentDidMount', () => {
    it('should initialize the SPA SDK and sync the CMS', () => {
      expect(initialize).toHaveBeenCalledWith(config);

      expect(page).toBeDefined();
      expect(page!.sync).toHaveBeenCalled();
    });

    it('should use a page model from props', async () => {
      jest.mocked(initialize as unknown as () => Page).mockReturnValue(page);
      const newPage = {} as PageModel;

      await act(async () => {
        render(<BrPage configuration={config} mapping={mapping} page={newPage} />);
      });

      expect(initialize).toBeCalledWith(config, newPage);
    });
  });

  describe('componentDidUpdate', () => {
    beforeEach(async () => {
      jest.mocked(initialize as unknown as () => Page).mockReturnValueOnce(page);

      await act(async () => {
        element.rerender(<BrPage configuration={config} mapping={mapping} page={page} />);
      });
    });

    it('should use a page instance from props when it is updated', async () => {
      const newPage = { ...page } as Page;
      const configuration = { ...config };

      jest.mocked(initialize as unknown as () => Page).mockReturnValueOnce(newPage);
      await act(async () => {
        element.rerender(<BrPage configuration={configuration} mapping={mapping} page={newPage} />);
      });

      expect(initialize).toBeCalledWith(configuration, newPage);
    });

    it('should initialize page on props update when page from props is not updated', async () => {
      const configuration = { ...config };

      jest.mocked(initialize as unknown as () => Page).mockReturnValueOnce(page);
      await act(async () => {
        element.rerender(<BrPage configuration={configuration} mapping={mapping} page={page} />);
      });

      expect(initialize).toBeCalledWith(configuration, page);
      expect(page.sync).toHaveBeenCalledTimes(1);
    });
  });

  describe('componentWillUnmount', () => {
    it('should destroy the page when unmounting', () => {
      element.unmount();
      expect(destroy).toHaveBeenCalledWith(page as Page);
    });

    it('should not destroy an empty page when unmounting', async () => {
      jest.mocked(initialize as unknown as () => Page).mockReturnValueOnce(undefined as unknown as Page);

      await act(async () => {
        element = render(<BrPage configuration={config} mapping={mapping} />);
      });

      element.unmount();
      expect(destroy).not.toHaveBeenCalled();
    });
  });

  describe('render', () => {
    it('should render children', async () => {
      await act(async () => {
        element = render(
          <BrPage configuration={config} mapping={mapping}>
            {children}
          </BrPage>,
        );
      });

      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should not render children if there is no page and NBR mode is false', async () => {
      jest.mocked(initialize as unknown as () => Page).mockReturnValueOnce(undefined as unknown as Page);

      await act(async () => {
        element = render(
          <BrPage configuration={{ ...config, NBRMode: false }} mapping={mapping}>
            {children}
          </BrPage>,
        );
      });

      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render children if there is no page and NBR mode is true', async () => {
      jest.mocked(initialize as unknown as () => Page).mockReturnValueOnce(undefined as unknown as Page);

      await act(async () => {
        element = render(
          <BrPage configuration={{ ...config, NBRMode: true }} mapping={mapping}>
            {children}
          </BrPage>,
        );
      });

      expect(element.asFragment()).toMatchSnapshot();
    });

    it('should render nothing if there is an error loading the page', async () => {
      const error = new Error('error-loading-page');
      jest.mocked(initialize).mockRejectedValueOnce(error);

      const consoleErrorSpyOn = jest.spyOn(console, 'error').mockImplementation(() => {});

      const FallbackComponent = <div>fallback</div>;
      const onErrorMock = jest.fn();
      const ErrorBoundaryComponent = (
        <ErrorBoundary fallback={FallbackComponent} onError={onErrorMock}>
          <BrPage configuration={config} mapping={mapping} />
        </ErrorBoundary>
      );

      await act(async () => {
        element = render(
          ErrorBoundaryComponent,
        );
      });

      expect(onErrorMock).toHaveBeenCalledWith(error, expect.anything());
      expect(element.getByText('fallback')).toBeVisible();
      expect(element.asFragment()).toMatchSnapshot();

      consoleErrorSpyOn.mockRestore();
    });

    it('should run child component effects while retrieving Page model when NBR mode is true', async () => {
      jest.useFakeTimers();

      const initializeDone = jest.fn();
      const someEffect = jest.fn();

      function MyComponent(): JSX.Element {
        useEffect(() => someEffect());
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
      }

      const pageInit = initialize(config);
      jest.mocked(initialize).mockClear();
      jest.mocked(initialize).mockImplementationOnce(() => {
        setTimeout(initializeDone, 1000);
        return pageInit;
      });

      await act(async () => {
        render(
          <BrPage configuration={{ ...config, NBRMode: true }} mapping={mapping}>
            <MyComponent />
          </BrPage>,
        );
      });

      jest.runAllTimers();
      const [someEffectOrder] = someEffect.mock.invocationCallOrder;
      const [initializeDoneOrder] = initializeDone.mock.invocationCallOrder;
      expect(someEffectOrder).toBeLessThan(initializeDoneOrder);

      jest.useRealTimers();
    });
  });
});
