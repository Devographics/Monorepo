import { ResponseDocument, SurveyDocument } from "@devographics/core-models"
import useSWR from "swr"
import { apiRoutes } from "~/lib/apiRoutes"

const basicFetcher = (url: string): any => fetch(url)
    .then((r) => r.json())
    .then((data) => {
        return { data };
    });

/**
 * Passing no surveySlug will get all responses for the user 
 */
export const useUserResponse = (params: { surveySlug: SurveyDocument["surveyId"] }) => {
    const { surveySlug } = params || {}
    const { data, error } = useSWR<ResponseDocument & { survey: SurveyDocument }>(apiRoutes.response.single.href({ surveySlug }),
        basicFetcher)
    const loading = !error && !data
    return { response: data, loading, error }
}

export const useUserResponses = () => {
    const { data, error } = useSWR<Array<ResponseDocument & { survey: SurveyDocument }>>(apiRoutes.response.multi.href, basicFetcher)
    const loading = !error && !data
    return { responses: data, loading, error }
}