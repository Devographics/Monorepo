import PrivacyPolicy from "./PrivacyPolicy";

// Uncomment to debug if this page is not statically rendered
// export const dynamic = "error";

// Render in each language
import { rscAllLocalesIds } from "~/lib/api/rsc-fetchers";
import { DEFAULT_REVALIDATE_S } from "~/app/revalidation";

// revalidating is important so we get fresh values from the cache every now and then without having to redeploy
export const revalidate = DEFAULT_REVALIDATE_S;
export const dynamicParams = true;
export async function generateStaticParams() {
  const localeIds = await rscAllLocalesIds();
  return localeIds.data?.map((localeId) => ({ lang: localeId })) || [];
}

const PrivacyPolicyPage = () => {
  return <PrivacyPolicy />;
};

export default PrivacyPolicyPage;
