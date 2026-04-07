import { LitElement, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { type Page, type Menu, type MenuItem, TYPE_LINK_EXTERNAL, isMenu } from '@bloomreach/spa-sdk';
import { brPageContext } from '@bloomreach/lit-sdk';
import '@bloomreach/lit-sdk';

@customElement('lit-menu')
export class LitMenu extends LitElement {
  @consume({ context: brPageContext, subscribe: true })
  private _page?: Page;

  // Light DOM for Bootstrap CSS and EM meta comments
  createRenderRoot() {
    return this;
  }

  private _getMenu(): Menu | undefined {
    if (!this._page) return undefined;

    // Try getting menu from the "menu" named component
    const menuComponent = this._page.getComponent()?.getComponent('menu');
    if (!menuComponent) return undefined;

    const menuRef = menuComponent.getModels<MenuModels>()?.menu;
    if (!menuRef) return undefined;

    const menu = this._page.getContent<Menu>(menuRef);
    return isMenu(menu) ? menu : undefined;
  }

  private _renderItem(item: MenuItem) {
    const url = item.getUrl();

    if (!url) {
      return html`<span class="nav-link text-capitalize disabled">${item.getName()}</span>`;
    }

    if (item.getLink()?.type === TYPE_LINK_EXTERNAL) {
      return html`<a class="nav-link text-capitalize" href=${url}>${item.getName()}</a>`;
    }

    return html`<a href=${url} class="nav-link text-capitalize">${item.getName()}</a>`;
  }

  render() {
    const menu = this._getMenu();
    if (!menu) return nothing;

    return html`
      <ul class="navbar-nav col-12 ${this._page?.isPreview() ? 'has-edit-button' : ''}">
        <br-manage-menu-button .menu=${menu}></br-manage-menu-button>
        ${menu.getItems().map((item) => html`
          <li class="nav-item ${item.isSelected() ? 'active' : ''}">
            ${this._renderItem(item)}
          </li>
        `)}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-menu': LitMenu;
  }
}
