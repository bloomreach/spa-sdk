import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume, provide } from '@lit/context';
import type { Component, Page } from '@bloomreach/spa-sdk';
import { isContainer, isContainerItem } from '@bloomreach/spa-sdk';
import { brPageContext, brComponentContext } from './context.js';

import './br-container.js';
import './br-container-item.js';

/**
 * Traverses the brXM component tree by name and renders children recursively.
 *
 * When used without a `name` attribute, renders the current component's children.
 * When `name` is provided, looks up a named child and renders its subtree
 * (works for containers, container items, and regular components).
 *
 * Usage:
 * ```html
 * <!-- Renders all children of the current component -->
 * <br-component></br-component>
 *
 * <!-- Renders the "main" container/component by name -->
 * <br-component name="main"></br-component>
 *
 * <!-- Multi-column layout example -->
 * <br-page .configuration=${config} .mapping=${mapping}>
 *   <div class="sidebar">
 *     <br-component name="left"></br-component>
 *   </div>
 *   <main>
 *     <br-component name="main"></br-component>
 *   </main>
 * </br-page>
 * ```
 */
@customElement('br-component')
export class BrComponent extends LitElement {
  /** Optional: name of the child component to resolve */
  @property({ type: String })
    name?: string;

  @consume({ context: brComponentContext, subscribe: true })
  private _parentComponent?: Component;

  @provide({ context: brComponentContext })
  @state()
  private _resolvedComponent?: Component;

  // Light DOM for Experience Manager compatibility
  createRenderRoot() {
    return this;
  }

  private _resolve(): Component | undefined {
    if (!this._parentComponent) { return undefined; }

    if (this.name) {
      return this._parentComponent.getComponent(this.name);
    }

    return this._parentComponent;
  }

  willUpdate() {
    this._resolvedComponent = this._resolve();
  }

  render() {
    const component = this._resolvedComponent;
    if (!component) { return nothing; }

    // When a name was given, render the resolved component itself
    // (it could be a container, container-item, or regular component)
    if (this.name) {
      return this._renderChild(component);
    }

    // No name: render all children of the current component
    const children = component.getChildren();
    return html`${children.map((child) => this._renderChild(child))}`;
  }

  private _renderChild(child: Component) {
    if (isContainerItem(child)) {
      return html`<br-container-item .component=${child}></br-container-item>`;
    }
    if (isContainer(child)) {
      return html`<br-container .component=${child}></br-container>`;
    }
    // Regular component — render its children recursively
    return html`<br-component-node .component=${child}></br-component-node>`;
  }
}

/**
 * Internal component for rendering a generic (non-container, non-container-item) component node.
 * Provides itself as the component context and renders its children.
 */
@customElement('br-component-node')
export class BrComponentNode extends LitElement {
  @property({ type: Object })
    component?: Component;

  @consume({ context: brPageContext, subscribe: true })
  private _page?: Page;

  @provide({ context: brComponentContext })
  @state()
  private _providedComponent?: Component;

  // Light DOM
  createRenderRoot() {
    return this;
  }

  private _clearMeta?: () => void;

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearMeta?.();
    this._clearMeta = undefined;
  }

  willUpdate() {
    this._providedComponent = this.component;
  }

  updated() {
    // Inject meta comments for Experience Manager
    this._clearMeta?.();
    this._clearMeta = undefined;
    if (this.component && this._page?.isPreview()) {
      const meta = this.component.getMeta();
      if (meta.length > 0) {
        this._clearMeta = meta.render(this, this);
      }
    }
  }

  render() {
    if (!this.component) { return nothing; }

    const children = this.component.getChildren();
    return html`${children.map((child) => this._renderChild(child))}`;
  }

  private _renderChild(child: Component) {
    if (isContainerItem(child)) {
      return html`<br-container-item .component=${child}></br-container-item>`;
    }
    if (isContainer(child)) {
      return html`<br-container .component=${child}></br-container>`;
    }
    return html`<br-component-node .component=${child}></br-component-node>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'br-component': BrComponent;
    'br-component-node': BrComponentNode;
  }
}
