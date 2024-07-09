// Functions prefixed with rsc are safe to call in RSCs
// (pages, layouts or even components, calls are automatically deduped)
// NOTE: fetch function are not necessarily actually using "fetch" calls
// so "cache" is needed
import { cache } from "react";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";

export const rscSurveysMetadata = cache(fetchSurveysMetadata);
export const rscEditionMetadataAdmin = cache(
  async ({ surveyId, editionId }: { surveyId: string; editionId: string }) => {
    const { data: surveys } = await rscSurveysMetadata({
      shouldGetFromCache: true,
    });
    const survey = surveys.find((s) => s.id === surveyId)!;
    const { data: edition } = await fetchEditionMetadataAdmin({
      surveyId,
      editionId,
      shouldGetFromCache: true,
    });
    return { survey, edition };
  }
);
