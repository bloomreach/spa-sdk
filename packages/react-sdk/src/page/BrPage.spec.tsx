/*
 * Copyright 2019-2025 Bloomreach
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
import { act, render, waitFor } from '@testing-library/react';
import { BrPage } from './BrPage';

jest.mock('@bloomreach/spa-sdk');

function TestComponent(): React.ReactElement {
  return <div>Test Component</div>;
}

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

const createMockPage = (): Page => ({
  isPreview: jest.fn(),
  getButton: jest.fn(),
  getComponent: () => ({
    getName: jest.fn(),
    getChildren: jest.fn(() => []),
    getMeta: jest.fn(),
  }),
  sync: jest.fn(),
}) as unknown as Page;

const mapping = { TestComponent };

describe('BrPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should initialize the SPA SDK with provided configuration', async () => {
      const page = createMockPage();
      jest.mocked(initialize).mockResolvedValue(page);

      await act(async () => {
        render(<BrPage configuration={config} mapping={mapping} />);
      });

      expect(initialize).toHaveBeenCalledWith(config);
    });

    it('should sync with the CMS upon mounting', async () => {
      const page = createMockPage();
      jest.mocked(initialize).mockResolvedValue(page);

      await act(async () => {
        render(<BrPage configuration={config} mapping={mapping} />);
      });

      await waitFor(() => {
        expect(page.sync).toHaveBeenCalled();
      });
    });

    it('should use a page model from props during SDK initialization', async () => {
      const page = createMockPage();
      const pageModel = {} as PageModel;
      jest.mocked(initialize as unknown as () => Page).mockReturnValue(page);

      await act(async () => {
        render(
          <BrPage configuration={config} mapping={mapping} page={pageModel} />,
        );
      });

      expect(initialize).toHaveBeenCalledWith(config, pageModel);
    });
  });

  describe('Component Updates', () => {
    it('should use a new page instance when passed via props', async () => {
      const initialPage = createMockPage();
      const newPage = createMockPage();
      jest
        .mocked(initialize as unknown as () => Page)
        .mockReturnValueOnce(initialPage)
        .mockReturnValueOnce(newPage);

      const { rerender } = render(
        <BrPage configuration={config} mapping={mapping} page={initialPage} />,
      );

      await act(async () => {
        rerender(
          <BrPage configuration={config} mapping={mapping} page={newPage} />,
        );
      });

      expect(initialize).toHaveBeenCalledWith(config, newPage);
    });

    it('should trigger proper reinitialization when configuration changes', async () => {
      const page = createMockPage();
      jest.mocked(initialize).mockResolvedValue(page);

      const { rerender } = render(
        <BrPage configuration={config} mapping={mapping} />,
      );

      const newConfig = { ...config, request: { path: '/new-path' } };

      await act(async () => {
        rerender(<BrPage configuration={newConfig} mapping={mapping} />);
      });

      await waitFor(() => {
        expect(destroy).toHaveBeenCalledWith(page);
        expect(initialize).toHaveBeenCalledWith(newConfig);
      });
    });

    it('should properly clean up and recreate page instances during updates', async () => {
      const oldPage = createMockPage();
      const newPage = createMockPage();
      jest
        .mocked(initialize)
        .mockResolvedValueOnce(oldPage)
        .mockResolvedValueOnce(newPage);

      const { rerender } = render(
        <BrPage configuration={config} mapping={mapping} />,
      );

      await waitFor(() => {
        expect(oldPage.sync).toHaveBeenCalled();
      });

      const newConfig = { ...config };
      await act(async () => {
        rerender(<BrPage configuration={newConfig} mapping={mapping} />);
      });

      await waitFor(() => {
        expect(destroy).toHaveBeenCalledWith(oldPage);
        expect(newPage.sync).toHaveBeenCalled();
      });
    });
  });

  describe('Component Cleanup', () => {
    it('should properly destroy the page instance when unmounting', async () => {
      const page = createMockPage();
      jest.mocked(initialize).mockResolvedValue(page);

      const { unmount } = render(
        <BrPage configuration={config} mapping={mapping} />,
      );

      await waitFor(() => {
        expect(page.sync).toHaveBeenCalled();
      });

      unmount();
      expect(destroy).toHaveBeenCalledWith(page);
    });

    it('should handle cleanup safely when page instance is undefined', async () => {
      jest.mocked(initialize).mockResolvedValue(undefined as unknown as Page);

      const { unmount } = render(
        <BrPage configuration={config} mapping={mapping} />,
      );

      unmount();
      expect(destroy).not.toHaveBeenCalled();
    });

    it('should prevent memory leaks when unmounting during async initialization', async () => {
      jest.useFakeTimers();

      const page = createMockPage();
      let resolveInitialize: (page: Page) => void;

      // Mock initialize to return a promise that we can control
      jest.mocked(initialize).mockImplementationOnce(() => {
        return new Promise<Page>((resolve) => {
          resolveInitialize = resolve;
        });
      });

      const { unmount } = render(
        <BrPage configuration={config} mapping={mapping} />,
      );

      // Unmount before the async initialize completes
      unmount();

      // Now resolve the promise - this should destroy the page immediately
      // instead of setting state on an unmounted component
      await act(async () => {
        resolveInitialize!(page);
        jest.runAllTimers();
      });

      // The page should be destroyed immediately, not set in state
      expect(destroy).toHaveBeenCalledWith(page);
      expect(page.sync).not.toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('Rendering Behavior', () => {
    const children = <div>Test Children</div>;

    it('should render children correctly within the BrPage wrapper', async () => {
      const page = createMockPage();
      jest.mocked(initialize).mockResolvedValue(page);

      const { getByText } = render(
        <BrPage configuration={config} mapping={mapping}>
          {children}
        </BrPage>,
      );

      await waitFor(() => {
        expect(getByText('Test Children')).toBeInTheDocument();
      });
    });

    it('should not render children when no page is available and NBR mode is disabled', async () => {
      jest.mocked(initialize).mockResolvedValue(undefined as unknown as Page);

      const { queryByText } = render(
        <BrPage configuration={{ ...config, NBRMode: false }} mapping={mapping}>
          {children}
        </BrPage>,
      );

      await waitFor(() => {
        expect(queryByText('Test Children')).not.toBeInTheDocument();
      });
    });

    it('should render children even without a page instance when NBR mode is enabled', async () => {
      jest.mocked(initialize).mockResolvedValue(undefined as unknown as Page);

      const { getByText } = render(
        <BrPage configuration={{ ...config, NBRMode: true }} mapping={mapping}>
          {children}
        </BrPage>,
      );

      await waitFor(() => {
        expect(getByText('Test Children')).toBeInTheDocument();
      });
    });

    it('should execute child component effects during asynchronous page initialization with NBR mode', async () => {
      jest.useFakeTimers();

      const initializeDone = jest.fn();
      const childEffect = jest.fn();

      function ChildComponent(): React.ReactElement {
        useEffect(() => {
          childEffect();
        }, []);
        return <div>Child Component</div>;
      }

      jest.mocked(initialize).mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            initializeDone();
            resolve(createMockPage());
          }, 1000);
        });
      });

      render(
        <BrPage configuration={{ ...config, NBRMode: true }} mapping={mapping}>
          <ChildComponent />
        </BrPage>,
      );

      expect(childEffect).toHaveBeenCalled();
      expect(initializeDone).not.toHaveBeenCalled();

      await act(async () => {
        jest.runAllTimers();
      });

      expect(initializeDone).toHaveBeenCalled();
      const [childEffectOrder] = childEffect.mock.invocationCallOrder;
      const [initializeOrder] = initializeDone.mock.invocationCallOrder;
      expect(childEffectOrder).toBeLessThan(initializeOrder);

      jest.useRealTimers();
    });
  });
});
