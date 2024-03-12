'use client'

import axios from "axios";
import {BrComponent, BrPage, BrPageContext} from "@bloomreach/react-sdk";
import Link from "next/link";
import {Menu} from "./Menu";
import React from "react";
import {Banner} from "./Banner";
import {Content} from "./Content";
import {NewsList} from "./NewsList";
import {Page} from "@bloomreach/spa-sdk";
import {ConfigurationBuilder} from "../utils/buildConfiguration";

interface Props {
  configuration: ConfigurationBuilder;
  page: Page
}

const BrxApp = ({configuration, page}: Props) => {
  const mapping = { Banner, Content, 'News List': NewsList, 'Simple Content': Content };

  return <BrPage configuration={{ ...configuration, httpClient: axios }} mapping={mapping} page={page}>
    <header>
      <nav className="navbar navbar-expand-sm navbar-dark sticky-top bg-dark" role="navigation">
        <div className="container">
          <BrPageContext.Consumer>
            {(contextPage) => (
              <Link href={contextPage?.getUrl('/') ?? ''} className="navbar-brand">
                {contextPage?.getTitle() || 'brXM + Next.js = ♥️'}
              </Link>
            )}
          </BrPageContext.Consumer>
          <div className="collapse navbar-collapse">
            <BrComponent path="menu">
              <Menu />
            </BrComponent>
          </div>
        </div>
      </nav>
    </header>
    <section className="container flex-fill pt-3">
      <BrComponent path="main" />
    </section>
    <footer className="bg-dark text-light py-3">
      <div className="container clearfix">
        <div className="float-left pr-3">&copy; Bloomreach</div>
        <div className="overflow-hidden">
          <BrComponent path="footer" />
        </div>
      </div>
    </footer>
  </BrPage>
}

export default BrxApp;
