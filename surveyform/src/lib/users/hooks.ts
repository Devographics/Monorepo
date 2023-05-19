import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";
import { UserType } from "~/lib/users/model";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());

interface ApiData<T = any> {
  data: T;
  error: any;
}

export const useCurrentUser = () => {
  const result = useSWR<UserType>(
    apiRoutes.users.loadCurrentUser.href(),
    basicFetcher
  );
  const { data, error, isLoading } = result;
  return { currentUser: data?.data, loading: isLoading, error: data?.error };
};
