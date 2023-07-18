import Link from "next/link";
import Breadcrumbs from "~/components/normalization/Breadcrumbs";
import { fetchSurveysMetadata } from "~/lib/api/fetch";
import { routes } from "~/lib/routes";

export default async function Page({ params }) {
  const surveys = await fetchSurveysMetadata();
  return (
    <div>
      <Breadcrumbs surveys={surveys} />
      {surveys.map((survey) => (
        <li key={survey.id}>
          <Link
            href={routes.admin.normalization.href({
              surveyId: survey.id,
            })}
          >
            {survey.id}
          </Link>
        </li>
      ))}
    </div>
  );
}
