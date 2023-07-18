import Link from "next/link";
import Breadcrumbs from "~/components/normalization/Breadcrumbs";
import { fetchEditionMetadata, fetchSurveysMetadata } from "~/lib/api/fetch";
import { routes } from "~/lib/routes";

export default async function Page({ params }) {
  const { surveyId } = params;
  const { data: surveys } = await fetchSurveysMetadata();
  const survey = surveys.find((s) => s.id === surveyId)!;
  return (
    <div>
      <Breadcrumbs surveys={surveys} survey={survey} />
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
