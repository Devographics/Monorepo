"use client";
import ShareSite from "../share/ShareSite";
import { getSurveyPath } from "~/modules/surveys/getters";
import Score from "../common/Score";
import Image from "next/image";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { getSurveyImageUrl } from "~/surveys/getSurveyImageUrl";
import Link from "next/link";
import { ResponseDocument, SurveyDocument } from "@devographics/core-models";

export const Thanks = ({
  survey,
  response,
  readOnly,
}: {
  survey: SurveyDocument;
  response?: ResponseDocument;
  readOnly?: boolean;
}) => {
  const imageUrl = getSurveyImageUrl(survey);
  const { name, year } = survey;

  return (
    <div className="contents-narrow thanks">
      <h1 className="survey-image survey-image-small">
        <Image
          width={300}
          height={200}
          src={imageUrl}
          alt={`${name} ${year}`}
          quality={100}
        />
      </h1>
      {response && <Score response={response} survey={survey} />}
      <div>
        <FormattedMessage id="general.thanks" />
      </div>
      <ShareSite survey={survey} />
      <div className="form-submit form-section-nav form-section-nav-bottom">
        <div className="form-submit-actions">
          <Link
            className="form-btn-prev"
            href={getSurveyPath({
              survey,
              response,
              readOnly,
              number: survey.outline.length,
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
