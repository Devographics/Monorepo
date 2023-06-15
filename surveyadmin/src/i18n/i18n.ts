import { locales } from "./data/locales";
/** We reexport this value that must stay in a JS file, because we use it in next.config.js */
export { locales } from "./data/locales";
import { makeLocalesRegistry } from "@vulcanjs/i18n";
import { StringsRegistry } from "@devographics/react-i18n";
// TODO: since we get the list of locales dynamically, we should probably get this from
// the server (same way we feed the locale switch button)

// export const convertStrings = (stringFile) => {
//   const convertedStrings = {};
//   const { namespace, translations } = stringFile;
//   translations.forEach(({ key, t }) => {
//     // survey namespaces are not currently supported
//     // const translationKey = namespace ? `${namespace}.${key}`: key;
//     const translationKey = key;
//     convertedStrings[translationKey] = t;
//   });
//   return convertedStrings;
// };

// expose a unique Locales registry
export const localesRegistry = makeLocalesRegistry();
export const { Locales, getLocale, registerLocale } = localesRegistry;
export const stringsRegistry = new StringsRegistry("en-Us")

locales.forEach((locale) => {
  //locales.forEach((locale) => {
  const { id, /*stringFiles,*/ label, rtl } = locale;
  // Make all locales dynamic => loaded from the server
  registerLocale({
    id,
    label,
    dynamic: true,
    rtl,
  });
  // Was used when loading locally? Now we get locales dynamically
  // if (id === 'en') {
  //   // add en language to client bundle so it can act as a fallback
  //   stringFiles.forEach((stringFile) => {
  //     addStrings(id, convertStrings(stringFile));
  //   });
  // }
});
