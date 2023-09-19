import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";
import { UserWithResponses } from "../responses/typings";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());

interface ApiData<T = any> {
  data: T;
  error: any;
}

/**
 * Get the current user client-side,
 * is able to poll to get up to date value without refreshing the page
 * 
 * If user is retrieved server-side, it should be passed as a fallback to top-level "SWRConfig"
 * @see https://swr.vercel.app/docs/with-nextjs#pre-rendering-with-default-data
 */
export const useCurrentUser = () => {
  const result = useSWR<ApiData<UserWithResponses | null>>(
    apiRoutes.account.currentUser.href,
    basicFetcher
  );
  const { data, error, isLoading } = result;
  // 3 cases: 
  // - still loading (data is not set, it shouldn't happen when using a fallback though)
  // - unauthenticated (data?.data is set but null)
  // - authenticated (data?.data is set and contains a user)
  if (!data) {
    console.warn("SWR hook was not initialized with currentUser from the server, did you set 'fallback' in SWRConfig?")
    console.warn({ data, error, isLoading })
  }
  const currentUser = data ? data?.data : undefined
  // /!\ When SWR uses the "fallback" value fetched server-side, "isLoading" is still true
  // so we prefer to add a more precise condition
  return { currentUser, loading: !data && isLoading, error: data?.error };
};
