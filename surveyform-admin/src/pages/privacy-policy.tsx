import PrivacyPolicy from "~/core/components/pages/PrivacyPolicy";
import { getLocaleStaticProps } from "~/i18n/server/ssr";

export const PrivacyPolicyPage = () => {
  return <PrivacyPolicy />;
};

export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default PrivacyPolicyPage;
