// TODO: this is a quick migration for state of js
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { initLocale, LocaleType } from "../intl";
/*
import { useCurrentUser } from "./currentUser";
*/
import { useCookies } from "react-cookie";

/*

Query to load strings for a specific locale from the server

*/
export const localeDataQuery = gql`
  query LocaleData($localeId: String) {
    locale(localeId: $localeId) {
      id
      strings
    }
  }
`;

/*

Hook

*/
export const useLocaleData = (props: { currentUser?: any; locale?: any }) => {
  const { currentUser } = props;
  const [cookies] = useCookies(["locale"]);
  //const { currentUser } = useCurrentUser();
  const init = initLocale({ currentUser, cookies, locale: props.locale });
  const queryResult = useQuery<{ locale: LocaleType }>(localeDataQuery, {
    variables: { localeId: init.id },
  });
  return { ...queryResult, ...init };
};
