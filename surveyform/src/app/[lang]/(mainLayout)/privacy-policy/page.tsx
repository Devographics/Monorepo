import PrivacyPolicy from "./PrivacyPolicy";

export const dynamic = "force-dynamic";

// uncomment to enable static builds
import { rscAllLocalesMetadata } from "~/lib/api/rsc-fetchers";
export async function generateStaticParams() {
  const locales = await rscAllLocalesMetadata();
  return locales.map((locale) => ({ lang: locale.id }));
}

const PrivacyPolicyPage = () => {
  return <PrivacyPolicy />;
};

export default PrivacyPolicyPage;
