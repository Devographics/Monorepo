"use client";
import React, { useState } from "react";
import type { SurveyEdition } from "@devographics/core-models";
import { useIntlContext } from "@devographics/react-i18n";
import { convertSurveyToMarkdown } from "~/surveys/outlineExport";
import { useEntities } from "~/core/components/common/EntitiesContext";
import { useEdition } from "./SurveyContext/Provider";

const SurveyExport = () => {
  const { edition } = useEdition();
  // @ts-ignore
  return <SurveyMarkdownOutline survey={edition} />;
};

export const SurveyMarkdownOutline = ({
  survey,
}: {
  survey: SurveyEdition;
}) => {
  const [showFieldName, setShowFieldName] = useState<boolean>(false);
  const intl = useIntlContext();
  // TODO: filter for the current survey only, but we need a tag to do so
  const entities = useEntities();
  return (
    <div className="survey-section-wrapper">
      <div>
        <label htmlFor="fieldname">Show fieldName? (for CSV/JSON export)</label>
        <input
          type="checkbox"
          id="fieldname"
          name="fieldname"
          onChange={(evt) => {
            setShowFieldName(evt.target.checked);
          }}
        />
      </div>
      <textarea
        style={{ width: 800, height: 600 }}
        value={convertSurveyToMarkdown({
          formatMessage: intl.formatMessage,
          // @ts-ignore
          survey: edition,
          entities,
          options: {
            showFieldName,
          },
        })}
      />
    </div>
  );
};

export default SurveyExport;
