/**
 * Mock factories for Bloomreach SPA SDK objects.
 * Each factory returns a vi.fn()-based mock implementing the required interface.
 */
import { vi } from 'vitest';

export interface MockMeta {
  render: ReturnType<typeof vi.fn>;
  length: number;
  [Symbol.iterator]: () => Iterator<any>;
}

export function createMockMeta(length = 0, renderFn?: () => () => void): MockMeta {
  const clearFn = vi.fn();
  return {
    render: vi.fn(renderFn ?? (() => clearFn)),
    length,
    * [Symbol.iterator]() {},
  };
}

export function createMockComponent(overrides: Record<string, any> = {}) {
  return {
    getId: vi.fn(() => 'comp-id'),
    getName: vi.fn(() => 'component-name'),
    getType: vi.fn(() => 'component'),
    getChildren: vi.fn(() => []),
    getComponent: vi.fn(() => undefined),
    getComponentById: vi.fn(() => undefined),
    getModels: vi.fn(() => ({})),
    getParameters: vi.fn(() => ({})),
    getMeta: vi.fn(() => createMockMeta()),
    getUrl: vi.fn(() => ''),
    ...overrides,
  };
}

export function createMockContainer(overrides: Record<string, any> = {}) {
  return {
    ...createMockComponent(),
    getType: vi.fn(() => 'hst.vbox'),
    getChildren: vi.fn(() => []),
    ...overrides,
  };
}

export function createMockContainerItem(overrides: Record<string, any> = {}) {
  const listeners: Record<string, Function[]> = {};
  return {
    ...createMockComponent(),
    getType: vi.fn(() => 'Banner'),
    isHidden: vi.fn(() => false),
    on: vi.fn((event: string, handler: Function) => {
      if (!listeners[event]) { listeners[event] = []; }
      listeners[event].push(handler);
    }),
    off: vi.fn((event: string, handler: Function) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((h) => h !== handler);
      }
    }),
    // Helper to simulate emitting an event (not part of SDK API)
    _emit: (event: string) => {
      listeners[event]?.forEach((h) => h({}));
    },
    ...overrides,
  };
}

export function createMockContent(overrides: Record<string, any> = {}) {
  return {
    getData: vi.fn(() => ({ title: 'Test Title', body: '<p>Test</p>' })),
    getId: vi.fn(() => 'content-id'),
    getName: vi.fn(() => 'content-name'),
    getUrl: vi.fn(() => '/content-url'),
    ...overrides,
  };
}

export function createMockPage(overrides: Record<string, any> = {}) {
  return {
    getComponent: vi.fn(() => createMockComponent()),
    getContent: vi.fn(() => undefined),
    getDocument: vi.fn(() => undefined),
    getUrl: vi.fn(() => '/'),
    isPreview: vi.fn(() => false),
    rewriteLinks: vi.fn((html: string) => html),
    sync: vi.fn(),
    toJSON: vi.fn(() => ({})),
    getButton: vi.fn(() => createMockMeta()),
    getTitle: vi.fn(() => 'Test Page'),
    ...overrides,
  };
}

/**
 * Helper to wait for a Lit element to finish its update cycle.
 */
export async function elementUpdated(el: any): Promise<void> {
  await el.updateComplete;
}

/**
 * Helper to create an element, attach to DOM, and wait for first render.
 */
export async function fixture<T extends HTMLElement>(tagName: string): Promise<T> {
  const el = document.createElement(tagName) as T;
  document.body.appendChild(el);
  await (el as any).updateComplete;
  return el;
}

/**
 * Cleanup helper — removes element from DOM.
 */
export function cleanup(el: HTMLElement) {
  el.remove();
}
