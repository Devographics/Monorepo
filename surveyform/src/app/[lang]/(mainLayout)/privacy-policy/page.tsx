import PrivacyPolicy from "./PrivacyPolicy";

// Render in each language
import { NextPageParams } from "~/app/typings";

// revalidating is important so we get fresh values from the cache every now and then without having to redeploy
export const revalidate = 54000; // 15mn
export const dynamicParams = true;
/*
export async function generateStaticParams() {
  const localeIds = await rscAllLocalesIds();
  return localeIds.data?.map((localeId) => ({ lang: localeId })) || [];
}
  */

const PrivacyPolicyPage = ({ params }: NextPageParams<{ lang: string }>) => {
  return <PrivacyPolicy />;
};

export default PrivacyPolicyPage;
