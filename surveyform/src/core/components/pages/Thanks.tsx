import React from "react";
import ShareSite from "../share/ShareSite";
import { getSurveyPath } from "~/modules/surveys/helpers";
import surveys from "~/surveys";
import Score from "../common/Score";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useSingle } from "@vulcanjs/react-hooks";
import { Response } from "~/modules/responses";
import { ResponseFragmentWithRanking } from "~/modules/responses/fragments";
import { useRouter } from "next/router.js";
import { useSurveyResponseParams } from "../survey/hooks";

const Thanks = () => {
  const { responseId } = useSurveyResponseParams();
  const Components = useVulcanComponents();
  const router = useRouter();

  const data = useSingle({
    model: Response,
    fragment: ResponseFragmentWithRanking,
    input: { id: responseId },
  });
  const { document: response, loading } = data;

  if (loading) {
    return <Components.Loading />;
  }
  if (!response) {
    return (
      <div>
        Could not find survey response document. Please reload, or if that
        doesn’t work{" "}
        <a href="https://github.com/StateOfJS/StateOfJS-Vulcan/issues">
          leave an issue
        </a>
        .
      </div>
    );
  }

  const survey = surveys.find((s) => s.slug === response.survey.slug);
  if (!survey)
    throw new Error(`Could not find survey for slug ${response.survey.slug}`);
  const { imageUrl, name, year } = survey;

  return (
    <div className="contents-narrow thanks">
      <h1 className="survey-image survey-image-small">
        <img src={`/surveys/${imageUrl}`} alt={`${name} ${year}`} />
      </h1>
      <Score response={response} survey={survey} />
      <div>
        <Components.FormattedMessage id="general.thanks" />
      </div>
      <ShareSite survey={survey} />
      <div className="form-submit form-section-nav form-section-nav-bottom">
        <div className="form-submit-actions">
          <Components.Button
            className="form-btn-prev"
            type="submit"
            variant="primary"
            onClick={async (e) => {
              e.preventDefault();
              router.push(
                getSurveyPath({
                  survey,
                  response,
                  number: survey.outline.length,
                })
              );
            }}
          >
            « <Components.FormattedMessage id="general.back" />
          </Components.Button>
        </div>
      </div>
    </div>
  );
};

export default Thanks;
