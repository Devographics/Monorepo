import Thanks from "~/core/components/pages/Thanks";

export const ThanksPage = () => {
  return <Thanks />;
};

import { getLocaleServerSideProps } from "~/i18n/server/ssr";
export async function getServerSideProps(ctx) {
  return getLocaleServerSideProps(ctx);
}

export default ThanksPage;
