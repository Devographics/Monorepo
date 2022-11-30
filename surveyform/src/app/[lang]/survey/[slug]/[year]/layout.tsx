import { notFound } from "next/navigation";
import { SurveyContextProvider } from "~/core/components/survey/SurveyContext/Provider";
import { fetchSurveyGithub } from "~/core/server/fetchSurveyGithub";
import surveys from "~/surveys";

const SURVEY_TIMEOUT_SECONDS = 5 * 60;
export const revalidate = SURVEY_TIMEOUT_SECONDS;

export async function generateStaticParams() {
  return surveys.map((s) => ({
    slug: s.prettySlug,
    year: String(s.year),
  }));
}
/**
 * TODO: get the list of surveys statically during getStaticParams call
 * @param param0
 * @returns
 */
export default async function SurveyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string; year: string };
}) {
  const { slug, year } = params;
  //const survey = getSurvey(slug, year);
  // First experiment getting the survey from github
  const survey = await fetchSurveyGithub(slug, year);
  if (!survey) {
    notFound();
  }
  return (
    <SurveyContextProvider survey={survey}>{children}</SurveyContextProvider>
  );
}
