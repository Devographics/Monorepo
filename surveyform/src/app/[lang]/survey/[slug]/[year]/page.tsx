import Support from "~/components/common/Support";
import { getSurveyImageUrl } from "~/lib/surveys/helpers";
import { EditionPage as EditionPageComponent } from "./components";
import { StringsRegistry } from "@devographics/react-i18n";
import { rscFetchLocaleFromUrl } from "~/i18n/server/rsc-fetchers";
import { rscMustGetSurveyEdition } from "./rsc-fetchers";

// revalidate survey/entities every 5 minutes
const SURVEY_TIMEOUT_SECONDS = 5 * 60;
export const revalidate = SURVEY_TIMEOUT_SECONDS;

async function getSurveyIntro(
  editionId: string,
  lang: string
): Promise<string> {
  // This is an experiment to load the survey intro as an RSC (with no JS)
  // It needs more work to get translated content in a robust manner
  // TODO: fetchLocaleFromUrl doesn't account for the survey context
  // TODO: correctly fallback to english
  const locDef = await rscFetchLocaleFromUrl({ langParam: lang });
  const enLocDef =
    lang === "en-US"
      ? locDef
      : await rscFetchLocaleFromUrl({
          langParam: "en-US",
          contexts: ["surveys"],
        });
  if (!locDef && !enLocDef) {
    console.warn("Could not load locales to get survey intro, lang:", locDef);
    return "";
  }
  const { localeId, localeWithStrings } = (locDef || enLocDef)!;
  const stringsRegistry = new StringsRegistry(localeId);
  stringsRegistry.addStrings(localeId, localeWithStrings.strings);
  if (localeId !== "en-US" && enLocDef) {
    stringsRegistry.addStrings("en-US", enLocDef.localeWithStrings.strings);
  }
  const intro = stringsRegistry.getString({
    localeId,
    id: `general.${editionId}.survey_intro`,
  });
  return intro;
}

interface SurveyPageServerProps {
  slug: string;
  year: string;
  // inherited from above segment
  lang: string;
}
export default async function SurveyPage({
  params: { slug, year, lang },
  searchParams,
}: {
  params: SurveyPageServerProps;
  searchParams: { "from-magic-login"?: string };
}) {
  const edition = await rscMustGetSurveyEdition({ slug, year });
  const imageUrl = getSurveyImageUrl(edition);
  let intro = "";
  try {
    // TODO: use this string in final version
    intro = await getSurveyIntro(edition.id, lang);
  } catch (err) {
    console.warn("couldn't get survey intro:", edition.id, lang);
  }
  if (searchParams["from-magic-login"]) {
    // TODO: check if user has a response
    // if they have a response => redirect to it
    // if not => create and redirect
  }
  return (
    <div>
      <EditionPageComponent
        edition={edition}
        imageUrl={imageUrl}
        editionIntro={intro}
        editionPath={`/survey/${slug}/${year}`}
      />
      <Support />
    </div>
  );
}
