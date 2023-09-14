"use client";
import { convertSurveyToMarkdown } from "~/lib/export/outlineExport";
import React, { useState } from "react";
import { EditionMetadata } from "@devographics/types";

export const SurveyMarkdownOutline = ({
  edition,
}: {
  edition: EditionMetadata;
}) => {
  const [showFieldName, setShowFieldName] = useState<boolean>(false);
  // const intl = useIntlContext();
  // TODO: filter for the current survey only, but we need a tag to do so
  //const { data, loading, error } = useEntitiesQuery();

  //if (loading) return <Loading />;
  //if (error) return <span>Could not load entities</span>;
  //if (!data) return <span>No entities found</span>;
  //const { entities } = data;

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
        readOnly={true}
        value={convertSurveyToMarkdown({
          formatMessage: (key) => key, // intl.formatMessage,
          edition,
          entities: [],
          options: {
            showFieldName,
          },
        })}
      />
    </div>
  );
};
