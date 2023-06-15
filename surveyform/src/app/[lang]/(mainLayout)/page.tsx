import Surveys from "~/app/[lang]/(mainLayout)/Surveys";

import { rscFetchSurveysMetadata } from "~/lib/surveys/rsc-fetchers";

// uncomment to make page static again
// import { rscAllLocalesMetadata } from "~/lib/api/rsc-fetchers";
// export async function generateStaticParams() {
//   const locales = await rscAllLocalesMetadata();
//   return locales.map((locale) => ({ lang: locale.id }));
// }

const IndexPage = async ({ params }) => {
  const surveys = await rscFetchSurveysMetadata();
  return <Surveys localeId={params.lang} surveys={surveys} />;
};

export default IndexPage;
