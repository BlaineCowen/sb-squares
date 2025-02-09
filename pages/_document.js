import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Link to the favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* You can also add other meta tags or links here */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
