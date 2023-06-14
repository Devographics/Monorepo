import { rscAllLocalesMetadata } from "~/lib/api/rsc-fetchers";
import PrivacyPolicy from "./PrivacyPolicy";

export async function generateStaticParams() {
  const locales = await rscAllLocalesMetadata();
  return locales.map((locale) => ({ lang: locale.id }));
}

const PrivacyPolicyPage = () => {
  return <PrivacyPolicy />;
};

export default PrivacyPolicyPage;
