import Link from "next/link";
import { fetchEditionMetadata, fetchSurveysMetadata } from "~/lib/api/fetch";
import { routes } from "~/lib/routes";

export default async function Page({ params }) {
  const { surveyId } = params;
  const surveys = await fetchSurveysMetadata();
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) {
    return <div>No survey {surveyId} found. </div>;
  }
  return (
    <div>
      <h2>{survey.name}</h2>
      {survey.editions.map((edition) => (
        <li key={edition.id}>
          <Link
            href={routes.admin.normalization.href({
              surveyId,
              editionId: edition.id,
            })}
          >
            {edition.id}
          </Link>
        </li>
      ))}
    </div>
  );
}
