"use client";
import { EditionMetadata, ResponseDocument } from "@devographics/types";
import Link from "next/link";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { getEditionSectionPath } from "~/lib/surveys/helpers/getEditionSectionPath";
import { FormattedMessage } from "../common/FormattedMessage";

export const ThanksBackButton = ({
  edition,
  response,
  readOnly,
}: {
  edition: EditionMetadata;
  response: ResponseDocument;
  readOnly?: boolean;
}) => {
  const { locale } = useLocaleContext();
  return (
    <div className="form-submit form-section-nav form-section-nav-bottom">
      <div className="form-submit-actions">
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
          « <FormattedMessage id="general.back" />
        </Link>
      </div>
    </div>
  );
};
