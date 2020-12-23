import React, { ReactNode } from "react";
import Head from "next/head";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = "This is the default title" }: Props) => (
  <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <main>{children}</main>
    <footer className="footer">
      <div className="content has-text-centered">
        © 2020{" "}
        <a href="https://sine.foundation" target="_blank" rel="noreferrer">
          SINE e.V.
        </a>{" "}
        All rights reserved :-)
      </div>
    </footer>
  </>
);

export default Layout;
