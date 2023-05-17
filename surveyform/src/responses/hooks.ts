import { ResponseDocument, SurveyEdition } from "@devographics/core-models";
import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";

const basicFetcher = (url: string): any =>
  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      return { data };
    });

interface ApiData<T = any> {
  data: T;
}

type ResponseWithSurvey = Required<ResponseDocument> & {
  survey: SurveyEdition;
};

/**
 * Passing no surveySlug will get all responses for the user
 * TODO: pass the response via a server call instead when possible
 * @deprecated
 */
export const useUserResponse = (params: {
  editionId: SurveyEdition["editionId"];
  surveyId: SurveyEdition["surveyId"];
}) => {
  const { editionId, surveyId } = params;
  const { data, error } = useSWR<ApiData<ResponseWithSurvey>>(
    apiRoutes.response.single.href({ editionId, surveyId }),
    basicFetcher
  );
  console.log("data", data, error);
  const loading = !error && !data;
  return { response: data?.data, loading, error };
};
