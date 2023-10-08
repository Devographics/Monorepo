import { FetchPayloadSuccessOrError } from "@devographics/fetch";
import { ResponseData } from "@devographics/types";
import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());

interface ApiData<T = any> {
  data: T;
  error: any;
}

export interface NormalizationResponse {
  _id: string;
  responseId: string;
  value: string;
  normalizedValue?: string[];
  patterns?: string[];
}

export type ResponsesData = {
  responses: Array<NormalizationResponse>;
  responsesCount: number;
  responsesSelector: any;
  questionResult: FetchPayloadSuccessOrError<ResponseData>;
};

export const useUnnormalizedData = (params: {
  surveyId: string;
  editionId: string;
  questionId: string;
}) => {
  const { data, error, isLoading } = useSWR<ApiData<ResponsesData>>(
    apiRoutes.normalization.loadUnnormalizedData.href(params),
    basicFetcher
  );
  return { data: data?.data, loading: isLoading, error: data?.error };
};

export const useQuestionResponses = (params: {
  surveyId: string;
  editionId: string;
  questionId: string;
}) => {
  const { data, error, isLoading } = useSWR<ApiData<ResponsesData>>(
    apiRoutes.normalization.loadQuestionResponses.href(params),
    basicFetcher
  );
  return { data: data?.data, loading: isLoading, error: data?.error };
};
