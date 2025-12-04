/*
 * Copyright 2025 Bloomreach
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

import React from 'react';
import { initialize, Page, PageModel } from '@bloomreach/spa-sdk';
import { render } from '@testing-library/react';
import { BrPageServer } from './BrPageServer';

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

describe('BrPageServer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should initialize the SPA SDK with provided configuration', async () => {
      const page = createMockPage();
      jest.mocked(initialize).mockResolvedValue(page);

      const result = await BrPageServer({ configuration: config, mapping });
      const { container } = render(result as React.ReactElement);

      expect(initialize).toHaveBeenCalledWith(config);
      expect(container).toBeInTheDocument();
    });

    it('should use a page model from props during SDK initialization', async () => {
      const page = createMockPage();
      const pageModel = {} as PageModel;
      jest.mocked(initialize as unknown as () => Page).mockReturnValue(page);

      const result = await BrPageServer({ configuration: config, mapping, page: pageModel });
      const { container } = render(result as React.ReactElement);

      expect(initialize).toHaveBeenCalledWith(config, pageModel);
      expect(container).toBeInTheDocument();
    });

    it('should return null when no page is available and NBR mode is disabled', async () => {
      jest.mocked(initialize).mockResolvedValue(undefined as unknown as Page);

      const result = await BrPageServer({ configuration: { ...config, NBRMode: false }, mapping });

      expect(result).toBeNull();
    });

    it('should return null when initialization fails and NBR mode is disabled', async () => {
      jest.mocked(initialize).mockResolvedValue(undefined as unknown as Page);

      const result = await BrPageServer({ configuration: { ...config, NBRMode: false }, mapping });

      expect(result).toBeNull();
    });
  });

  describe('Rendering Behavior', () => {
    const children = <div>Test Children</div>;

    it('should render children correctly within the BrPageServer wrapper', async () => {
      const page = createMockPage();
      jest.mocked(initialize).mockResolvedValue(page);

      const result = await BrPageServer({ configuration: config, mapping, children });
      const { getByText } = render(result as React.ReactElement);

      expect(getByText('Test Children')).toBeInTheDocument();
    });

    it('should not render children when no page is available and NBR mode is disabled', async () => {
      jest.mocked(initialize).mockResolvedValue(undefined as unknown as Page);

      const result = await BrPageServer({
        configuration: { ...config, NBRMode: false },
        mapping,
        children,
      });

      expect(result).toBeNull();
    });

    it('should return null when NBR mode is enabled but no page is available', async () => {
      jest.mocked(initialize).mockResolvedValue(undefined as unknown as Page);

      const result = await BrPageServer({
        configuration: { ...config, NBRMode: true },
        mapping,
        children,
      });

      // Note: BrPageServer returns null when no page is available, even in NBRMode
      // This is different from BrPage which renders children in NBRMode
      expect(result).toBeNull();
    });

    it('should render with BrNodeServer when page is available', async () => {
      const page = createMockPage();
      jest.mocked(initialize).mockResolvedValue(page);

      const result = await BrPageServer({ configuration: config, mapping, children });
      const { container } = render(result as React.ReactElement);

      // Verify that the structure includes the children
      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('Render Props Pattern', () => {
    it('should support render props pattern with page, component, and mapping', async () => {
      const page = createMockPage();
      jest.mocked(initialize).mockResolvedValue(page);

      const renderProp = jest.fn(({ page: renderPage, component, mapping: renderMapping, isClientComponent }) => (
        <div>
          Page:
          {' '}
          {renderPage ? 'exists' : 'missing'}
          Component:
          {' '}
          {component ? 'exists' : 'missing'}
          Mapping:
          {' '}
          {renderMapping ? 'exists' : 'missing'}
          Is Client Component:
          {' '}
          {isClientComponent ? 'true' : 'false'}
        </div>
      ));

      const result = await BrPageServer({ configuration: config, mapping, children: renderProp });
      const { getByText } = render(result as React.ReactElement);

      expect(renderProp).toHaveBeenCalledWith({
        page,
        component: expect.any(Object),
        mapping,
        isClientComponent: false,
      });
      expect(getByText('Page: exists', { exact: false })).toBeInTheDocument();
      expect(getByText('Component: exists', { exact: false })).toBeInTheDocument();
      expect(getByText('Mapping: exists', { exact: false })).toBeInTheDocument();
      expect(getByText('Is Client Component: false', { exact: false })).toBeInTheDocument();
    });

    it('should work with both render props and regular children patterns', async () => {
      const page = createMockPage();
      jest.mocked(initialize).mockResolvedValue(page);

      // Test regular children
      const result1 = await BrPageServer({
        configuration: config,
        mapping,
        children: <div>Regular children</div>,
      });
      const { getByText: getByText1 } = render(result1 as React.ReactElement);

      expect(getByText1('Regular children')).toBeInTheDocument();

      // Test render props
      const result2 = await BrPageServer({
        configuration: config,
        mapping,
        children: ({ page: renderPage }) => (
          <div>
            Render prop:
            {renderPage ? 'with page' : 'no page'}
          </div>
        ),
      });
      const { getByText: getByText2 } = render(result2 as React.ReactElement);

      expect(getByText2(/Render prop:.*with page/)).toBeInTheDocument();
    });
  });

  describe('Page Model Handling', () => {
    it('should handle Page instance passed as prop', async () => {
      const page = createMockPage();
      jest.mocked(initialize as unknown as () => Page).mockReturnValue(page);

      const result = await BrPageServer({ configuration: config, mapping, page });
      const { container } = render(result as React.ReactElement);

      expect(initialize).toHaveBeenCalledWith(config, page);
      expect(container).toBeInTheDocument();
    });

    it('should handle PageModel passed as prop', async () => {
      const page = createMockPage();
      const pageModel = {} as PageModel;
      jest.mocked(initialize as unknown as () => Page).mockReturnValue(page);

      const result = await BrPageServer({ configuration: config, mapping, page: pageModel });
      const { container } = render(result as React.ReactElement);

      expect(initialize).toHaveBeenCalledWith(config, pageModel);
      expect(container).toBeInTheDocument();
    });
  });
});
