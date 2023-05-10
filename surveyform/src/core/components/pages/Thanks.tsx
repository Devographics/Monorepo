"use client";
import ShareSite from "../share/ShareSite";
import { getEditionSectionPath } from "~/surveys/helpers";
import Score from "../common/Score";
import Image from "next/image";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { getSurveyImageUrl } from "~/surveys/getSurveyImageUrl";
import Link from "next/link";
import { useEdition } from "~/surveys/components/SurveyContext/Provider";
// import { ResponseDocument } from "@devographics/core-models";
import { useResponse } from "~/surveys/components/ResponseContext/ResponseProvider";
import { useLocaleContext } from "~/i18n/context/LocaleContext";

export const Thanks = ({
  //response,
  readOnly,
}: {
  //response?: ResponseDocument;
  readOnly?: boolean;
}) => {
  const { locale } = useLocaleContext();
  const { edition, editionPathSegments } = useEdition();
  const imageUrl = getSurveyImageUrl(edition);
  const { survey, year } = edition;
  const { name } = survey;
  // TODO: get from server, see ongoing investigation
  const response = useResponse();

  return (
    <div className="contents-narrow thanks">
      <h1 className="survey-image survey-image-small">
        {imageUrl && (
          <Image
            width={300}
            height={200}
            src={imageUrl}
            alt={`${name} ${year}`}
            quality={100}
          />
        )}
      </h1>
      {response && <Score response={response} edition={edition} />}
      <div>
        <FormattedMessage id="general.thanks" />
      </div>
      <ShareSite survey={edition} />
      <div className="form-submit form-section-nav form-section-nav-bottom">
        <div className="form-submit-actions">
          <Link
            className="form-btn-prev"
            href={getEditionSectionPath({
              edition,
              response,
              forceReadOnly: readOnly,
              number: edition.sections.length,
              editionPathSegments,
              locale,
            })}
          >
            « <FormattedMessage id="general.back" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Thanks;
