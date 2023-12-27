import { loadNormalizationPercentages } from "~/actions/loadNormalizationPercentages";
import LoadingButton from "~/components/LoadingButton";

export const RecalculateProgress = ({ survey, edition }) => {
  return (
    <LoadingButton
      as="a"
      label="Recalculate Progress"
      tooltip="Refresh cache and update progress counts"
      action={async () => {
        "use server";
        const result = await loadNormalizationPercentages({
          surveyId: survey.id,
          editionId: edition.id,
          forceRefresh: true,
        });
        console.log(result);
      }}
    />
  );
};

export default RecalculateProgress;
