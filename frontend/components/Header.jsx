import React from "react";
import Head from "next/head";

export default function Header({ title, description }) {
  return (
    <Head>
      <title>{title}</title>
      <meta name={description} content="Whitelist-Dapp" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
