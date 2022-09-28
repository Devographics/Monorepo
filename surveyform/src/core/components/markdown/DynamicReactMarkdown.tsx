import dynamic from "next/dynamic";

// @ts-ignore
export const DynamicReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => "...",
  ssr: false,
});
