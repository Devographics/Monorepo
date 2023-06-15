import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";
import { UserWithResponses } from "../responses/typings";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());

interface ApiData<T = any> {
  data: T;
  error: any;
}

export const useCurrentUser = () => {
  const result = useSWR<ApiData<UserWithResponses>>(
    apiRoutes.account.currentUser.href,
    basicFetcher
  );
  const { data, error, isLoading } = result;
  return { currentUser: data?.data, loading: isLoading, error: data?.error };
};
