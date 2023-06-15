import PrivacyPolicy from "./PrivacyPolicy";

// TODO: @upstash/redis is incompatible with static rendering
// @see https://github.com/upstash/upstash-redis/issues/397
export const dynamic = "force-static";

// uncomment to enable static builds
/*
import { rscAllLocalesMetadata } from "~/lib/api/rsc-fetchers";
export async function generateStaticParams() {
  const locales = await rscAllLocalesMetadata();
  return locales.map((locale) => ({ lang: locale.id }));
}
*/

const PrivacyPolicyPage = () => {
  return <PrivacyPolicy />;
};

export default PrivacyPolicyPage;
