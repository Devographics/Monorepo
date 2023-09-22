import useSWR from "swr";
import { ApiData, apiRoutes } from "~/lib/apiRoutes";
import { UserWithResponses } from "../responses/typings";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());


/**
 * Get the current user client-side,
 * is able to poll to get up to date value without refreshing the page
 * 
 * If user is retrieved server-side, it should be passed as a fallback to top-level "SWRConfig"
 * @see https://swr.vercel.app/docs/with-nextjs#pre-rendering-with-default-data
 */
export const useCurrentUser = ({ userFromServer }: {
  /** 
   * Optionnaly pass user data that will be used for the first render,
   * before SWR updates the value via client-side data fetching
   * 
   * This can also be done at layout level for a group of dynamic pages, see SWRConfig
   */
  userFromServer?: UserWithResponses
} = {}) => {
  let fallbackData
  if (typeof userFromServer !== "undefined") {
    // NOTE: userFromServer is "null" if user is not authenticated (but NOT "undefined")
    fallbackData = { data: userFromServer }
  }
  const result = useSWR<ApiData<UserWithResponses | null>>(
    apiRoutes.account.currentUser.href,
    basicFetcher,
    { fallbackData }
  );
  const { data, error, isLoading } = result;
  // 4 cases: 
  // - still loading (data is not set, it shouldn't happen when using a fallback though)
  // - client side data fetching is ongoing, but we have server-side fetched fallback (data is set but isLoading is also true)
  // /!\ When SWR uses the "fallback" value fetched server-side, "isLoading" is still true
  // - unauthenticated (data?.data is set but null)
  // - authenticated (data?.data is set and contains a user)
  const currentUser = data ? data?.data : undefined
  // so we prefer to add a more precise condition
  return { currentUser, loading: !data && isLoading, error: data?.error };
};
