import Support from "~/components/common/Support";
import { mustGetSurveyEdition } from "./fetchers";
import { getSurveyImageUrl } from "~/lib/surveys/helpers";
import { initRedis } from "@devographics/redis";

import { serverConfig } from "~/config/server";
import { EditionPage as EditionPageComponent } from "./components";
import { StringsRegistry } from "@devographics/react-i18n";
import { cachedFetchLocaleFromUrl } from "~/i18n/server/rsc-fetchers";

async function getSurveyIntro(
  editionId: string,
  lang: string
): Promise<string> {
  // This is an experiment to load the survey intro as an RSC (with no JS)
  // It needs more work to get translated content in a robust manner
  // TODO: fetchLocaleFromUrl doesn't account for the survey context
  // TODO: correctly fallback to english
  const locDef = await cachedFetchLocaleFromUrl({ langParam: lang });
  const enLocDef =
    lang === "en-US"
      ? locDef
      : await cachedFetchLocaleFromUrl({
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
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  initRedis(serverConfig().redisUrl);
  const edition = await mustGetSurveyEdition({ slug, year });
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
      />
      <Support />
    </div>
  );
}
