import { ResponseDocument, SurveyDocument } from "@devographics/core-models"
import useSWR from "swr"
import { apiRoutes } from "~/lib/apiRoutes"

const basicFetcher = (url: string) => fetch(url)
    .then((r) => r.json())
    .then((data) => {
        return { data };
    });

/**
 * Passing no surveySlug will get all responses for the user 
 */
export const useUserResponse = (params: { surveySlug: SurveyDocument["surveyId"] }) => {
    const { surveySlug } = params || {}
    const { data, error } = useSWR<ResponseDocument>(apiRoutes.responses.single.href({ surveySlug }),
        basicFetcher)
    const loading = !error && !data
    return { response: data, loading, error }
}