/**
 * In the future we might want to standardize those exports
 * @see https://github.com/VulcanJS/vulcan-next/issues/9
 */
import { LocalesRegistry, StringsRegistry } from "../intl";

//addGraphQLSchema(localeType);

/**
 * Reusable helper to avoid calling the "locale" API from graphql,
 * during SSR
 * @param registries
 * @returns
 */
export const getLocaleFromRegistries =
  (registries: {
    LocalesRegistry: LocalesRegistry;
    StringsRegistry: StringsRegistry;
  }) =>
  (localeId: string) => {
    const locale = registries.LocalesRegistry.getLocale(localeId);
    const strings = registries.StringsRegistry.getStrings(localeId);
    const localeObject = { ...locale, strings };
    return localeObject;
  };

const locale =
  (registries: {
    LocalesRegistry: LocalesRegistry;
    StringsRegistry: StringsRegistry;
  }) =>
  async (root, { localeId }, context) => {
    return getLocaleFromRegistries(registries)(localeId);
  };

/**
 * TODO: I think the "dynamic" version is specific to State of surveys
 * It is not currently used in Vulcan, as we load translation string in-app and not dynamically
 * via a 3rd party API
 */
const typeDefs = `type Locale {
  id: String,
  label: String
  dynamic: Boolean
  strings: JSON
}

type Query {
  locale(localeId: String): Locale
}
`;
const resolvers = (registries) => ({
  Query: {
    // NOTE: you can override this resolver if you want to be able to load strings dynamically
    locale: locale(registries),
  },
});

//addGraphQLQuery("locale(localeId: String): Locale");
//addGraphQLResolvers({ Query: { locale } });

/**
 * To be merged in your own schema
 */
export const graphql = {
  typeDefs,
  makeResolvers: (registries: {
    LocalesRegistry: LocalesRegistry;
    StringsRegistry: StringsRegistry;
  }) => resolvers(registries),
};
