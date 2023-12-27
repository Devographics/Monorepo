"use server"
import { captureException } from "@sentry/nextjs";
import { getNormalizationPercentages } from "~/lib/normalization/actions/getNormalizationPercentages";


export async function loadNormalizationPercentages({ surveyId, editionId, forceRefresh }: { surveyId: string, editionId: string, forceRefresh?: boolean }) {
    try {
        const data = await getNormalizationPercentages({
            surveyId,
            editionId,
            shouldGetFromCache: !forceRefresh,
        });
        return { data };
    } catch (error) {
        console.error(error);
        captureException(error);
        return {
            error: {
                id: "load_normalization_percentages_error",
                message: error.message,
                error,
            },
        }
    }
}
