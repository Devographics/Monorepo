import Breadcrumbs from "~/components/normalization/Breadcrumbs";
import { NormalizeQuestionWithProvider } from "~/components/normalization/NormalizeQuestion";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestions } from "~/lib/normalization/helpers/getEditionQuestions";

// We don't want static rendering in survey admin
export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { surveyId, editionId, questionId } = params;
  const { data: surveys } = await fetchSurveysMetadata({
    shouldGetFromCache: false,
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
      <Breadcrumbs
        surveys={surveys}
        survey={survey}
        edition={edition}
        question={question}
      />
      <NormalizeQuestionWithProvider
        survey={survey}
        edition={edition}
        question={question}
      />
      {/* {unnormalizedFields.map((field, i) => (
        <Field key={i} field={field} />
      ))} */}
    </div>
  );
}

const Field = ({ field }) => {
  return <li>{JSON.stringify(field)}</li>;
};
