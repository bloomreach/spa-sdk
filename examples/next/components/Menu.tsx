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

import React, {JSX} from 'react';
import Link from 'next/link';
import { MenuItem, Menu as BrMenu, TYPE_LINK_EXTERNAL, isMenu } from '@bloomreach/spa-sdk';
import { BrManageMenuButton, BrProps } from '@bloomreach/react-sdk';

interface MenuLinkProps {
  item: MenuItem;
}

function MenuLink({ item }: MenuLinkProps): JSX.Element {
  const url = item.getUrl();

  if (!url) {
    return <span className="nav-link text-capitalize disabled">{item.getName()}</span>;
  }

  if (item.getLink()?.type === TYPE_LINK_EXTERNAL) {
    return (
      <a className="nav-link text-capitalize" href={url}>
        {item.getName()}
      </a>
    );
  }

  return (
    <Link href={url} className="nav-link text-capitalize">
      {item.getName()}
    </Link>
  );
}

export function Menu({ component, page, mapping }: BrProps): JSX.Element | null {
  // Try getting menu from component first (if available)
  let menuRef = component?.getModels<MenuModels>()?.menu;

  // If no component or no menu ref, try getting menu directly from page
  if (!menuRef && page) {
    const menuComponent = page.getComponent('menu');
    menuRef = menuComponent?.getModels<MenuModels>()?.menu;
  }

  const menu = menuRef && page?.getContent<BrMenu>(menuRef);

  if (!isMenu(menu)) {
    return null;
  }

  return (
    <ul className={`navbar-nav col-12 ${page?.isPreview() ? 'has-edit-button' : ''}`}>
      <BrManageMenuButton menu={menu} page={page} mapping={mapping} />
      {menu.getItems().map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={index} className={`nav-item ${item.isSelected() ? 'active' : ''}`}>
          <MenuLink item={item} />
        </li>
      ))}
    </ul>
  );
}
