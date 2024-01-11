import { Message, StringsRegistry } from "@devographics/react-i18n-legacy";
import { rscLocale } from "~/lib/api/rsc-fetchers";
import { getCommonContexts } from "./config";

/**
 * RSC equivalent to useIntlContext from
 * "@devographics/react-i18n-legacy/Provider.tsx"
 */
export async function rscIntlContext({
  localeId,
  contexts,
}: {
  localeId: string;
  contexts?: Array<string>;
}) {
  // TODO: if Next.js ever lands a "params()" equivalent to "cookies()" and "headers()",
  // use it here instead of passing the localeId via argument
  // 1. feed the string registry
  const stringsRegistry = new StringsRegistry(localeId);
  const { data: loc } = await rscLocale({
    localeId,
    contexts: contexts || getCommonContexts(),
  });
  const { data: enLoc } = await rscLocale({
    localeId: "en-US",
    contexts: contexts || getCommonContexts(),
  });
  if (loc) {
    stringsRegistry.addStrings(localeId, loc.strings);
  }
  if (enLoc) {
    stringsRegistry.addStrings("en-US", enLoc.strings);
  }
  if (!(loc || enLoc)) {
    console.warn(`Couldn't get locale ${localeId} or en-US`);
  }
  // TODO: fallback to default locale (en-US)
  return {
    formatMessage: (msg: Message): string => {
      return stringsRegistry.getString({
        localeId,
        ...msg,
      });
    },
  };
}
