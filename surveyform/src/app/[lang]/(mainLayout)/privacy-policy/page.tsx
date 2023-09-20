import PrivacyPolicy from "./PrivacyPolicy";

// Uncomment to debug if this page is not statically rendered
// export const dynamic = "error";

// Render in each language
import { rscAllLocalesIds } from "~/lib/api/rsc-fetchers";
export async function generateStaticParams() {
  const localeIds = await rscAllLocalesIds();
  return localeIds.data?.map((localeId) => ({ lang: localeId })) || [];
}

const PrivacyPolicyPage = () => {
  return <PrivacyPolicy />;
};

export default PrivacyPolicyPage;
