import { captureException } from "@sentry/nextjs";
import { notFound } from "next/navigation";
import { EntitiesProvider } from "~/core/components/common/EntitiesContext";
import { fetchEntitiesRedis } from "~/core/server/fetchEntitiesRedis";
import { SurveyProvider } from "~/surveys/components/SurveyContext/Provider";
import { fetchSurveyGithub } from "~/surveys/server/fetch";

// revalidate survey/entities every 5 minutes
const SURVEY_TIMEOUT_SECONDS = 5 * 60;
export const revalidate = SURVEY_TIMEOUT_SECONDS;

// TODO: not yet compatible with having dynamic pages down the tree
// we may have to call generateStaticParams in each static page instead
// @see https://github.com/vercel/next.js/issues/44712
/*
export async function generateStaticParams() {
  return surveys.map((s) => ({
    slug: s.prettySlug,
    year: String(s.year),
  }));
}*/

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
  const survey = await fetchSurveyGithub(slug, year);
  if (!survey) {
    notFound();
  }
  // NOTE: if fetch entities was based on survey slug
  // we could run those queries in //
  // (not useful in static mode though)
  let entities = [];
  try {
    const redisEntities = await fetchEntitiesRedis(survey.surveyId);
    if (!redisEntities) throw new Error("Entities not found in Redis");
    entities = redisEntities;
  } catch (err) {
    captureException(err);
  }

  // Apply survey colors
  const { colors } = survey;
  const style = `
:root {
  --bg-color: ${/*bgColor*/ colors.background};
  --text-color: ${/*textColor*/ colors.text};
  --link-color: ${/*linkColor*/ colors.primary};
  --hover-color: ${/*hoverColor*/ colors.secondary};
}
  `;

  return (
    <SurveyProvider survey={survey}>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <EntitiesProvider entities={entities}>{children}</EntitiesProvider>
    </SurveyProvider>
  );
}
