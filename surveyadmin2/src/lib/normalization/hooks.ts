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

export const useUnnormalizedFields = (params: {
  editionId: string;
  questionId: string;
}) => {
  const { data, error, isLoading } = useSWR<ApiData<Project>>(
    apiRoutes.normalization.loadFields.href(params),
    basicFetcher
  );
  console.log("data", data, error);
  return { data: data?.data, loading: isLoading, error: data?.error };
};
