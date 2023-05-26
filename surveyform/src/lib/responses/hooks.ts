import { ResponseDocument } from "@devographics/types";
import useSWR from "swr";
import { apiRoutes } from "~/lib/apiRoutes";

const basicFetcher = (url: string): any => fetch(url).then((r) => r.json());

interface ApiData<T = any> {
  data: T;
  error: any;
}

/**
 * @deprecated "useResponse" gets the response from layout context directly
 * @param params 
 * @returns 
 */
export const useResponseClient = (params: { responseId?: string }) => {
  const { responseId } = params;
  const { data, error, isLoading } = useSWR<ApiData<ResponseDocument>>(
    responseId && apiRoutes.responses.loadResponse.href({ responseId }),
    basicFetcher
  );
  // console.log("data", data, error);
  return { response: data?.data, loading: isLoading, error: data?.error };
};
