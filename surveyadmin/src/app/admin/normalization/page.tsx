import Link from "next/link";
import Breadcrumbs from "~/components/normalization/Breadcrumbs";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { routes } from "~/lib/routes";

export default async function Page({ params }) {
  const { data: surveys } = await fetchSurveysMetadata({
    addCredits: false,
  });
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
