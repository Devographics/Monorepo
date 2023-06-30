import PrivacyPolicy from "./PrivacyPolicy";

// TODO: @upstash/redis is incompatible with static rendering
// @see https://github.com/upstash/upstash-redis/issues/397
// TODO: forcing static doesn't work in prod
// export const dynamic = "force-static";

// uncomment to enable static builds
/*
import { rscAllLocalesIds } from "~/lib/api/rsc-fetchers";
export async function generateStaticParams() {
  const localeIds = await rscAllLocalesIds();
  return localeIds.map((localeId) => ({ lang: localeId}));
}
*/

const PrivacyPolicyPage = () => {
  return <PrivacyPolicy />;
};

export default PrivacyPolicyPage;
