//import dynamic from "next/dynamic";

import ReactMarkdown from "react-markdown";
// @ts-ignore
// FIXME: script building chokes on "next/dynamic" because components leak via "customComponents"
export const DynamicReactMarkdown =
  ReactMarkdown; /*dynamic(() => import("react-markdown"), {
  loading: () => "<div>Loading...</div>",
  ssr: false,
});*/
