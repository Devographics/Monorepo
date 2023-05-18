import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());

interface ApiData<T = any> {
  data: T;
}

export const useCurrentUser = () => {
  const { data, error } = useSWR<ApiData<any>>(
    apiRoutes.currentUser.load.href(),
    basicFetcher
  );
  const loading = !error && !data;
  return { currentUser: data?.data, loading, error };
};
