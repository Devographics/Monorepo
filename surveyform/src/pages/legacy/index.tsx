import Surveys from "~/core/components/pages/Surveys";
import { getLocaleStaticProps } from "~/i18n/server/ssr";
export const IndexPage = () => {
  return <Surveys />;
};

export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default IndexPage;
