import Surveys from "~/app/[lang]/(mainLayout)/Surveys";
import { DebugRSC } from "~/components/debug/DebugRSC";

import { rscFetchSurveysMetadata } from "~/lib/surveys/rsc-fetchers";
// uncomment to enable static builds
/*
import { rscAllLocalesIds } from "~/lib/api/rsc-fetchers";
export async function generateStaticParams() {
  const localeIds = await rscAllLocalesIds();
  return localeIds.map((localeId) => ({ lang: localeId}));
}
*/

const IndexPage = async ({ params }) => {
  const { data: surveys, ___metadata: ___rscFetchSurveysMetadata } =
    await rscFetchSurveysMetadata();
  return (
    <>
      <DebugRSC {...{ ___rscFetchSurveysMetadata }} />
      <Surveys localeId={params.lang} surveys={surveys} />
    </>
  );
};

export default IndexPage;
