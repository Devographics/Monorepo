import Breadcrumbs from "~/components/normalization/Breadcrumbs";
import { NormalizeQuestion } from "~/components/normalization/NormalizeQuestion";
import { fetchEditionMetadata, fetchSurveysMetadata } from "~/lib/api/fetch";
import { getEditionQuestions } from "~/lib/normalization/helpers";

export default async function Page({ params }) {
  const { surveyId, editionId, questionId } = params;
  const surveys = await fetchSurveysMetadata();
  const edition = await fetchEditionMetadata({ surveyId, editionId });
  if (!edition) {
    return (
      <div>
        No edition {surveyId}/{editionId} found.
      </div>
    );
  }
  const survey = edition.survey;
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
      <Breadcrumbs survey={survey} edition={edition} question={question} />
      <NormalizeQuestion
        surveys={surveys}
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
