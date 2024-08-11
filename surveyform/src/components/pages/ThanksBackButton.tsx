"use client";
import { EditionMetadata, ResponseDocument } from "@devographics/types";
import Link from "next/link";
import { getEditionSectionPath } from "~/lib/surveys/helpers/getEditionSectionPath";
import { T, useI18n } from "@devographics/react-i18n";

export const ThanksBackButton = ({
  edition,
  response,
  readOnly,
}: {
  edition: EditionMetadata;
  response: ResponseDocument;
  readOnly?: boolean;
}) => {
  const { locale } = useI18n()
  return (
    <div className="form-submit form-section-nav form-section-nav-bottom">
      <div className="form-submit-actions form-submit-back">
        <Link
          className="form-btn-prev"
          href={getEditionSectionPath({
            edition,
            survey: edition.survey,
            response,
            readOnly,
            number: edition.sections.length,
            locale,
          })}
        >
          « <T token="general.back_to_survey" />
        </Link>
      </div>
    </div>
  );
};
