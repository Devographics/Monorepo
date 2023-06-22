import Link from "next/link";
import { Normalization } from "~/components/normalization/Normalization";
import { fetchEditionMetadata, fetchSurveysMetadata } from "~/lib/api/fetch";
import { getUnnormalizedFields } from "~/lib/normalization/actions";
import { routes } from "~/lib/routes";

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

  const unnormalizedFields = await getUnnormalizedFields({
    surveyId,
    editionId,
    questionId,
  });
  return (
    <div>
      <h2>
        {survey.name}/{edition.id}/{questionId}
      </h2>
      <Normalization
        surveys={surveys}
        edition={edition}
        questionId={questionId}
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
