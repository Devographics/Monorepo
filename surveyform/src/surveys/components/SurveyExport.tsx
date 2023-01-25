"use client";
import React, { useState } from "react";
import { useRouter } from "next/router.js";
import type { SurveyDocument } from "@devographics/core-models";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { convertSurveyToMarkdown } from "~/surveys/outlineExport";
import surveys from "~/surveys";
import { useEntities } from "~/core/components/common/EntitiesContext";

const useCurrentSurvey = () => {
  const router = useRouter();
  const { query } = router;
  const { slug, year } = query;
  const survey = surveys.find(
    (s) => s.prettySlug === slug && Number(s.year) === Number(year)
  );
  return { survey, slug, year };
};
const SurveyExport = () => {
  // TODO: filter for the current survey only, but we need a tag to do so
  const { survey, slug, year } = useCurrentSurvey();
  if (!survey) {
    return (
      <div>
        Survey with slug <strong>{slug}</strong> and year{" "}
        <strong>{year}</strong> not found
      </div>
    );
  } else {
    return <SurveyMarkdownOutline survey={survey} />;
  }
};

export const SurveyMarkdownOutline = ({
  survey,
}: {
  survey: SurveyDocument;
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
          survey,
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
