import Surveys from "~/app/[lang]/(mainLayout)/Surveys";

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
  const surveys = await rscFetchSurveysMetadata();
  return <Surveys localeId={params.lang} surveys={surveys} />;
};

export default IndexPage;
