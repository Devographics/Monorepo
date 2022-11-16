import React from "react";
import ShareSite from "../share/ShareSite";
import { getSurveyPath } from "~/modules/surveys/getters";
import Score from "../common/Score";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useSingle } from "@vulcanjs/react-hooks";
import { Response } from "~/modules/responses";
import { ResponseFragmentWithRanking } from "~/modules/responses/fragments";
import { useSurveyResponseParams } from "../survey/hooks";
import surveys from "~/surveys";
import Image from "next/image";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { getSurveyImageUrl } from "~/surveys/getSurveyImageUrl";
import { EntitiesProvider } from "~/core/components/common/EntitiesContext";
import Link from "next/link";
import { ResponseDocument, SurveyDocument } from "@devographics/core-models";

const Thanks = () => {
  const { responseId, slug, year } = useSurveyResponseParams();
  const readOnly = responseId === "read-only";

  const survey = surveys.find(
    (s) => s.prettySlug === slug && s.year === Number(year)
  );

  if (!survey) {
    throw new Error("Could not find survey.");
  }

  const props = { survey };
  return readOnly ? (
    <ThanksInner {...props} readOnly={readOnly} />
  ) : (
    <ThanksWithResponse {...props} responseId={responseId} />
  );
};

const ThanksWithResponse = ({
  survey,
  responseId,
}: {
  survey: SurveyDocument;
  responseId: string;
}) => {
  const Components = useVulcanComponents();

  const data = useSingle({
    model: Response,
    fragment: survey && ResponseFragmentWithRanking(survey),
    input: { id: responseId },
  });
  const {
    document,
    loading,
  }: { document: ResponseDocument; loading: boolean } = data;

  if (loading) {
    return <Components.Loading />;
  }

  return <ThanksInner survey={survey} response={document} />;
};

const ThanksInner = ({
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
    <EntitiesProvider surveyId={survey.surveyId}>
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
    </EntitiesProvider>
  );
};

export default Thanks;
