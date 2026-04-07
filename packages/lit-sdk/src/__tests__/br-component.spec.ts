import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isContainer, isContainerItem } from '@bloomreach/spa-sdk';
import { createMockComponent, createMockContainerItem, createMockPage, createMockMeta, cleanup, elementUpdated } from './mocks.js';

vi.mock('@bloomreach/spa-sdk', () => ({
  initialize: vi.fn(),
  destroy: vi.fn(),
  isContainer: vi.fn(() => false),
  isContainerItem: vi.fn(() => false),
  TYPE_CONTAINER_INLINE: 'hst.span',
  TYPE_CONTAINER_NO_MARKUP: 'hst.nomarkup',
  TYPE_CONTAINER_ORDERED_LIST: 'hst.orderedlist',
  TYPE_CONTAINER_UNORDERED_LIST: 'hst.unorderedlist',
  TYPE_MANAGE_CONTENT_BUTTON: 'MANAGE_CONTENT_BUTTON',
  TYPE_MANAGE_MENU_BUTTON: 'MANAGE_MENU_BUTTON',
}));

import '../br-component.js';
import type { BrComponent, BrComponentNode } from '../br-component.js';

describe('br-component', () => {
  let el: BrComponent;

  afterEach(() => {
    if (el?.parentNode) cleanup(el);
  });

  describe('without name', () => {
    it('renders all children of parent component', async () => {
      const child1 = createMockComponent({ getName: vi.fn(() => 'child1') });
      const child2 = createMockComponent({ getName: vi.fn(() => 'child2') });
      const parent = createMockComponent({
        getChildren: vi.fn(() => [child1, child2]),
      });

      el = document.createElement('br-component') as BrComponent;
      // Set the consumed context property directly
      (el as any)._parentComponent = parent;
      document.body.appendChild(el);
      await el.updateComplete;

      // Should render br-component-node for each regular component child
      const nodes = el.querySelectorAll('br-component-node');
      expect(nodes.length).toBe(2);
    });

    it('returns nothing when parent component is undefined', async () => {
      el = document.createElement('br-component') as BrComponent;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.children.length).toBe(0);
    });
  });

  describe('with name', () => {
    it('resolves named child via getComponent(name)', async () => {
      const namedChild = createMockComponent({ getName: vi.fn(() => 'main') });
      const parent = createMockComponent({
        getComponent: vi.fn((name: string) => name === 'main' ? namedChild : undefined),
        getChildren: vi.fn(() => [namedChild]),
      });

      el = document.createElement('br-component') as BrComponent;
      el.name = 'main';
      (el as any)._parentComponent = parent;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(parent.getComponent).toHaveBeenCalledWith('main');
    });

    it('returns nothing when named child is not found', async () => {
      const parent = createMockComponent({
        getComponent: vi.fn(() => undefined),
      });

      el = document.createElement('br-component') as BrComponent;
      el.name = 'nonexistent';
      (el as any)._parentComponent = parent;
      document.body.appendChild(el);
      await el.updateComplete;

      // No br-container, br-container-item, or br-component-node rendered
      expect(el.querySelector('br-container')).toBeNull();
      expect(el.querySelector('br-container-item')).toBeNull();
      expect(el.querySelector('br-component-node')).toBeNull();
    });
  });

  describe('child type dispatch', () => {
    it('renders <br-container> for container children', async () => {
      const containerChild = createMockComponent();
      vi.mocked(isContainer).mockImplementation((c: any) => c === containerChild);
      vi.mocked(isContainerItem).mockReturnValue(false);

      const parent = createMockComponent({
        getChildren: vi.fn(() => [containerChild]),
      });

      el = document.createElement('br-component') as BrComponent;
      (el as any)._parentComponent = parent;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.querySelector('br-container')).not.toBeNull();
    });

    it('renders <br-container-item> for container-item children', async () => {
      // Must include on/off since br-container-item calls component.on('update')
      const itemChild = createMockContainerItem();
      vi.mocked(isContainerItem).mockImplementation((c: any) => c === itemChild);
      vi.mocked(isContainer).mockReturnValue(false);

      const parent = createMockComponent({
        getChildren: vi.fn(() => [itemChild]),
      });

      el = document.createElement('br-component') as BrComponent;
      (el as any)._parentComponent = parent;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.querySelector('br-container-item')).not.toBeNull();
    });

    it('renders <br-component-node> for regular component children', async () => {
      const regularChild = createMockComponent();
      vi.mocked(isContainer).mockReturnValue(false);
      vi.mocked(isContainerItem).mockReturnValue(false);

      const parent = createMockComponent({
        getChildren: vi.fn(() => [regularChild]),
      });

      el = document.createElement('br-component') as BrComponent;
      (el as any)._parentComponent = parent;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.querySelector('br-component-node')).not.toBeNull();
    });
  });

  describe('light DOM', () => {
    it('uses light DOM (no shadowRoot)', async () => {
      el = document.createElement('br-component') as BrComponent;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.shadowRoot).toBeNull();
    });
  });
});

describe('br-component-node', () => {
  let el: BrComponentNode;

  afterEach(() => {
    if (el?.parentNode) cleanup(el);
  });

  it('renders children recursively', async () => {
    const grandChild = createMockComponent();
    const child = createMockComponent({
      getChildren: vi.fn(() => [grandChild]),
    });
    const component = createMockComponent({
      getChildren: vi.fn(() => [child]),
    });

    vi.mocked(isContainer).mockReturnValue(false);
    vi.mocked(isContainerItem).mockReturnValue(false);

    el = document.createElement('br-component-node') as BrComponentNode;
    (el as any).component = component;
    document.body.appendChild(el);
    await el.updateComplete;

    // Should have rendered a nested br-component-node
    const nestedNode = el.querySelector('br-component-node');
    expect(nestedNode).not.toBeNull();
  });

  it('returns nothing when component is undefined', async () => {
    el = document.createElement('br-component-node') as BrComponentNode;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.children.length).toBe(0);
  });

  it('injects meta comments in preview mode', async () => {
    const meta = createMockMeta(2);
    const component = createMockComponent({
      getMeta: vi.fn(() => meta),
      getChildren: vi.fn(() => []),
    });
    const page = createMockPage({ isPreview: vi.fn(() => true) });

    el = document.createElement('br-component-node') as BrComponentNode;
    (el as any).component = component;
    (el as any)._page = page;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(meta.render).toHaveBeenCalledWith(el, el);
  });

  it('does NOT inject meta in live mode', async () => {
    const meta = createMockMeta(2);
    const component = createMockComponent({
      getMeta: vi.fn(() => meta),
      getChildren: vi.fn(() => []),
    });
    const page = createMockPage({ isPreview: vi.fn(() => false) });

    el = document.createElement('br-component-node') as BrComponentNode;
    (el as any).component = component;
    (el as any)._page = page;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(meta.render).not.toHaveBeenCalled();
  });

  it('cleans up meta on disconnect', async () => {
    const clearFn = vi.fn();
    const meta = createMockMeta(2, () => clearFn);
    const component = createMockComponent({
      getMeta: vi.fn(() => meta),
      getChildren: vi.fn(() => []),
    });
    const page = createMockPage({ isPreview: vi.fn(() => true) });

    el = document.createElement('br-component-node') as BrComponentNode;
    (el as any).component = component;
    (el as any)._page = page;
    document.body.appendChild(el);
    await el.updateComplete;

    el.remove();

    expect(clearFn).toHaveBeenCalled();
  });

  it('uses light DOM (no shadowRoot)', async () => {
    el = document.createElement('br-component-node') as BrComponentNode;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot).toBeNull();
  });
});
