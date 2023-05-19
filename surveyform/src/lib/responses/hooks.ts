import { ResponseDocument, SurveyEdition } from "@devographics/core-models";
import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());

interface ApiData<T = any> {
  data: T;
  error: any;
}

type ResponseWithSurvey = Required<ResponseDocument> & {
  survey: SurveyEdition;
};

export const useResponse = (params: { responseId: string }) => {
  const { responseId } = params;
  const { data, error, isLoading } = useSWR<ApiData<ResponseWithSurvey>>(
    apiRoutes.responses.loadResponse.href({ responseId }),
    basicFetcher
  );
  console.log("data", data, error);
  return { response: data?.data, loading: isLoading, error: data?.error };
};
