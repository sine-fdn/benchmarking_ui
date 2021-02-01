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
    <main>
      <div
        className="container"
        style={{ position: "sticky", top: 0, left: 0, textAlign: "right" }}
      >
        <svg width="210" height="80">
          <line
            x1="39"
            y1="39"
            x2="84"
            y2="39"
            stroke="black"
            strokeWidth="1.5"
          ></line>
          <line
            x1="84"
            y1="39"
            x2="128"
            y2="39"
            stroke="black"
            strokeWidth="1.5"
          ></line>
          <line
            x1="128"
            y1="39"
            x2="172"
            y2="39"
            stroke="black"
            strokeWidth="1.5"
          ></line>

          <g transform="translate(25, 25)">
            <circle
              cx="14"
              cy="14"
              r="13"
              fill="white"
              stroke="black"
              strokeWidth="1.5"
            ></circle>
            <path
              d="M14.2359 20.204C15.5279 20.204 16.5819 19.881 17.3979 19.218C18.2139 18.555 18.6389 17.705 18.6389 16.668C18.6389 15.801 18.3839 15.104 17.8909 14.594C17.3979 14.084 16.6329 13.727 15.5789 13.506L13.1989 13.013C12.3829 12.86 11.8049 12.639 11.4989 12.35C11.1929 12.078 11.0399 11.653 11.0399 11.092C11.0399 10.429 11.2949 9.885 11.8049 9.46C12.3149 9.052 13.0119 8.831 13.8619 8.831C14.7289 8.831 15.4429 9.035 16.0039 9.409C16.5479 9.783 16.8879 10.31 16.9899 10.973H18.4009C18.2819 9.919 17.8229 9.103 17.0409 8.525C16.2419 7.947 15.1709 7.658 13.8449 7.658C12.6039 7.658 11.5839 7.998 10.8019 8.644C10.0029 9.307 9.61188 10.14 9.61188 11.143C9.61188 12.01 9.84988 12.707 10.3599 13.217C10.8699 13.744 11.6519 14.101 12.7059 14.288L15.0179 14.747C15.7829 14.9 16.3439 15.138 16.7009 15.444C17.0409 15.75 17.2279 16.192 17.2279 16.736C17.2279 17.45 16.9389 18.011 16.3949 18.419C15.8509 18.827 15.1199 19.031 14.2189 19.031C13.1309 19.031 12.2809 18.81 11.6689 18.368C11.0569 17.926 10.6999 17.263 10.6319 16.413H9.22088C9.28888 17.62 9.78188 18.555 10.6659 19.218C11.5499 19.881 12.7399 20.204 14.2359 20.204Z"
              fill="black"
            ></path>
          </g>
          <g transform="translate(25, 25)">
            <circle
              cx="59"
              cy="14"
              r="13"
              fill="white"
              stroke="black"
              strokeWidth="1.5"
            ></circle>
            <path d="M59.7188 20V7.862H58.2568V20H59.7188Z" fill="black"></path>
          </g>
          <g transform="translate(25, 25)">
            <circle
              cx="103"
              cy="14"
              r="13"
              fill="white"
              stroke="black"
              strokeWidth="1.5"
            ></circle>
            <path
              d="M98.1313 7.862V20H99.5593V9.647H99.5933L106.495 20H107.855V7.862H106.444V17.552H106.41L99.9333 7.862H98.1313Z"
              fill="black"
            ></path>
          </g>
          <g transform="translate(25, 25)">
            <circle
              cx="147"
              cy="14"
              r="13"
              fill="white"
              stroke="black"
              strokeWidth="1.5"
            ></circle>
            <path
              d="M151.338 18.776H144.572V14.56H150.573V13.319H144.572V9.086H151.321V7.862H143.127V20H151.338V18.776Z"
              fill="black"
            ></path>
          </g>
        </svg>
      </div>
      {children}
    </main>
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
