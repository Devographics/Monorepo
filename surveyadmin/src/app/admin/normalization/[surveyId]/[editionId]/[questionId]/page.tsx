import Breadcrumbs from "~/components/normalization/Breadcrumbs";
import { NormalizeQuestionWithProvider } from "~/components/normalization/NormalizeQuestion";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestions } from "~/lib/normalization/helpers/getEditionQuestions";
import { getLocaleDict } from "@devographics/i18n/server";
import { rscLocaleFromParams } from "~/lib/api/i18n";
import {
  getCommonContexts,
  getEditionContexts,
  getSurveyContexts,
} from "~/lib/api/config";
import { I18nContextProvider } from "@devographics/react-i18n";
import QuestionHeading from "~/components/normalization/QuestionHeading";

// We don't want static rendering in survey admin
export const dynamic = "force-dynamic";

export default async function Page(props) {
  const params = await props.params;
  const { surveyId, editionId, questionId } = params;

  const { data: surveys } = await fetchSurveysMetadata({
    shouldGetFromCache: false,
    addCredits: false,
  });
  const survey = surveys.find((s) => s.id === surveyId)!;
  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
    shouldGetFromCache: false,
  });

  const question = getEditionQuestions(edition).find(
    (q) => q.id === questionId
  );
  if (!question) {
    return (
      <div>
        No question {surveyId}/{editionId}/{questionId} found.
      </div>
    );
  }

  const {
    locale,
    localeId,
    error: localeError,
  } = await rscLocaleFromParams({
    lang: "en-US",
    contexts: [
      // NOTE:
      // we reload common contexts here because there is no parent layout,
      // context is not shared with (mainLayout pages) that are outside of the scope of a precise survey
      // we could have a shared layout between (mainLayout) and "survey/[slug]/[year]" that handle common locales
      // so we don't have to reload commonContext translations in the surveys page
      ...getCommonContexts(),
      ...getSurveyContexts(survey),
      ...getEditionContexts(edition),
    ],
  });
  if (localeError) {
    console.log(localeError);
    throw new Error(
      `Can't load translations from API, error: ${JSON.stringify(localeError)}`
    );
  }

  // const unnormalizedFields = await getUnnormalizedFields({
  //   surveyId,
  //   editionId,
  //   questionId,
  // });
  // const responsesCount = await getQuestionResponsesCount({
  //   surveyId,
  //   editionId,
  //   questionId,
  // });
  return (
    <div>
      <I18nContextProvider locale={locale} allLocales={[locale]}>
        <Breadcrumbs
          surveys={surveys}
          survey={survey}
          edition={edition}
          question={question}
          heading={<QuestionHeading question={question} />}
        />
        <NormalizeQuestionWithProvider
          survey={survey}
          edition={edition}
          question={question}
        />
        {/* {unnormalizedFields.map((field, i) => (
        <Field key={i} field={field} />
      ))} */}
      </I18nContextProvider>
    </div>
  );
}

const Field = ({ field }) => {
  return <li>{JSON.stringify(field)}</li>;
};
