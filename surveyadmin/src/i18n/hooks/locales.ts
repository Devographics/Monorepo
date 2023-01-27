import gql from "graphql-tag";
import { useQuery } from "~/lib/graphql";
import { Locale } from "../typings";

const localesQuery = gql`
  query LocalesQuery {
    locales {
      id
      label
      translators
      repo
      translatedCount
      totalCount
      completion
    }
  }
`;

/**
 * List possible locales (without strings, just the local meta informations)
 * @returns
 */
export const useLocales = () => {
  const { loading, data } =
    useQuery<{ locales: Array<Omit<Locale, "strings">> }>(localesQuery);
  // NOTE: apollo will convert undefined results from graphql to null for some reason, thus breaking default values
  return { loading, locales: data?.locales || undefined };
};
