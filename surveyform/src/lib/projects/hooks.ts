import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());

interface ApiData<T = any> {
  data: T;
  error: any;
}

type Project = {
  id: string;
};

export const useProjects = (params: { query: string }) => {
  const { query } = params;
  const { data, error, isLoading } = useSWR<ApiData<Project>>(
    query && apiRoutes.projects.search.href({ query }),
    basicFetcher
  );
  console.log("data", data, error);
  return { projects: data?.data, loading: isLoading, error: data?.error };
};
