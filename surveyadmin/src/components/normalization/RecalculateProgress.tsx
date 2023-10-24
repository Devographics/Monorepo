"use client";
import { loadNormalizationPercentages } from "~/lib/normalization/services";
import LoadingButton from "~/components/LoadingButton";

export const RecalculateProgress = ({ survey, edition }) => (
  <LoadingButton
    as="a"
    label="Recalculate Progress"
    tooltip="Refresh cache and update progress counts"
    action={async () => {
      const result = await loadNormalizationPercentages({
        surveyId: survey.id,
        editionId: edition.id,
        forceRefresh: false,
      });
      console.log(result);
    }}
  />
);

export default RecalculateProgress;
