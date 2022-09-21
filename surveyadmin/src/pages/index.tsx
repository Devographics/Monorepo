import { getLocaleStaticProps } from "~/i18n/server/ssr";
export const IndexPage = () => {
  return <a href="/admin">Go to admin area</a>;
};

export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default IndexPage;
