import { ResponseDocument, SurveyEdition } from "@devographics/core-models";
import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());

interface ApiData<T = any> {
  data: T;
}

type ResponseWithSurvey = Required<ResponseDocument> & {
  survey: SurveyEdition;
};

export const useResponse = (params: { responseId: string }) => {
  const { responseId } = params;
  const { data, error } = useSWR<ApiData<ResponseWithSurvey>>(
    apiRoutes.response.load.href({ responseId }),
    basicFetcher
  );
  console.log("data", data, error);
  const loading = !error && !data;
  return { response: data?.data, loading, error };
};
