"use client";
import { useState } from "react";
import Options from "./Options";
import { normalizeResponses } from "~/lib/normalization/services";
import { LoadingButton } from "../LoadingButton";
import { NormalizationResult } from "./NormalizationResult";
// import Dropdown from "~/core/components/ui/Dropdown";

export const NormalizeResponses = ({ survey, edition }) => {
  const [responsesIds, setResponsesIds] = useState<Array<string>>([]);
  const [result, setResult] = useState<any>();
  return (
    <section>
      <h4>Normalize response(s)</h4>

      <div className="normalize-responses">
        <input
          value={responsesIds}
          onChange={(e) => {
            const value = e.target.value;
            const ids = value.split(",");
            setResponsesIds(ids);
          }}
          type="text"
          placeholder="Reponse(s) ID(s), comma-separated"
        />
        <LoadingButton
          action={async () => {
            const result = await normalizeResponses({
              surveyId: survey.id,
              editionId: edition.id,
              responsesIds,
            });
            setResult(result.data);
            console.log(result);
          }}
          label="Normalize Response(s)"
        />
      </div>
      {result && <NormalizationResult {...result} />}
    </section>
  );
};
export default NormalizeResponses;
