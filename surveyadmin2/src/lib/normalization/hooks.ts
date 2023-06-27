import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());

interface ApiData<T = any> {
  data: T;
  error: any;
}

export interface UnnormalizedResponses {
  _id: string;
  responseId: string;
  value: string;
}

export type UnnormalizedData = {
  unnormalizedResponses: Array<UnnormalizedResponses>;
  responsesCount: number;
};

export const useUnnormalizedData = (params: {
  surveyId: string;
  editionId: string;
  questionId: string;
}) => {
  const { data, error, isLoading } = useSWR<ApiData<UnnormalizedData>>(
    apiRoutes.normalization.loadUnnormalizedData.href(params),
    basicFetcher
  );
  console.log("data", data, error);
  return { data: data?.data, loading: isLoading, error: data?.error };
};
