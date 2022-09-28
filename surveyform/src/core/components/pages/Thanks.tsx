import React from "react";
import ShareSite from "../share/ShareSite";
import { getSurveyPath } from "~/modules/surveys/getters";
import Score from "../common/Score";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useSingle } from "@vulcanjs/react-hooks";
import { Response } from "~/modules/responses";
import { ResponseFragmentWithRanking } from "~/modules/responses/fragments";
import { useRouter } from "next/router.js";
import { useSurveyResponseParams } from "../survey/hooks";
import surveys from "~/surveys";
import Image from "next/image";

const Thanks = () => {
  const { responseId, slug, year } = useSurveyResponseParams();

  const Components = useVulcanComponents();
  const router = useRouter();
  const survey = surveys.find(
    (s) => s.prettySlug === slug && s.year === Number(year)
  );

  const data = useSingle({
    model: Response,
    fragment: survey && ResponseFragmentWithRanking(survey),
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

  if (!survey) {
    return <div>Could not find survey.</div>;
  }
  const { imageUrl, name } = survey;

  return (
    <div className="contents-narrow thanks">
      <h1 className="survey-image survey-image-small">
        <Image
          width={300}
          height={200}
          src={`/surveys/${imageUrl}`}
          alt={`${name} ${year}`}
        />
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
