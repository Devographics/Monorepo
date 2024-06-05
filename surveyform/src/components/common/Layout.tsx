import React from "react";
import Footer from "./Footer";
import Header, { tokens as tokensHeader } from "./Header";
// import DevographicsBanner from "./DevographicsBanner";
import TokyoDev from "~/components/common/TokyoDev";
import { teapot } from "@devographics/react-i18n";

export const { T, tokens } = teapot(["general.skip_to_content", ...tokensHeader])

export const Layout = ({ children }: { children: any }) => {
  return (
    <div className="wrapper" id="wrapper">
      <a href="#section-questions" className="skip">
        {/** 
         * Layout is a "shared component", 
         * ideally we should have a "SharedT" that rely either on the client or server context to get tokens
         * but that's dead complicated so we stick to the client component T
         * @see https://github.com/vercel/next.js/discussions/58862#discussioncomment-9666053
         */}
        <T token="general.skip_to_content" />
      </a>
      {/* <DevographicsBanner /> */}
      <Header />
      <main className="main-contents" id="main-contents">
        {children}
        <TokyoDev />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
