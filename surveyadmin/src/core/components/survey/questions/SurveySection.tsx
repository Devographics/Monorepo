/*

1. Look for responseId and section number in URL params
2. Load response from server using withSingle2 HoC
3. Display response form restricted to questions of current section via `fields` prop

Note: form has a customized "FormSubmit" component to show the prev/next buttons

*/
import React from "react";
import SurveyNav from "./SurveyNav";
import SurveySectionContents from "./SurveySectionContents";
import SurveyHeadTags from "../SurveyHeadTags";
import SurveyMessage from "../SurveyMessage";
import { useSurveyResponseParams } from "../hooks";
import { useSingle } from "@vulcanjs/react-hooks";
import { Response } from "~/modules/responses/model";
import { ResponseFragment } from "~/modules/responses/fragments";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { getFragmentName } from "@vulcanjs/graphql";
import { surveysWithTemplates } from "~/surveys/withTemplates";
const surveys = surveysWithTemplates;

const SurveySection = () => {
  let { responseId, sectionNumber = 1 } = useSurveyResponseParams();

  const data = useSingle({
    model: Response,
    fragment: ResponseFragment,
    fragmentName: getFragmentName(ResponseFragment),
    input: { id: responseId },
    queryOptions: {
      pollInterval: 0,
    },
  });
  const { document: response, loading } = data;
  const Components = useVulcanComponents();
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
  if (!survey) throw new Error(`Survey with slug ${survey} not found`);
  const surveyOutline = survey.outline;
  const sectionIndex = sectionNumber - 1;
  const section = surveyOutline[sectionIndex];
  const previousSection = surveyOutline[sectionIndex - 1];
  const nextSection = surveyOutline[sectionIndex + 1];
  const sectionProps = {
    sectionNumber,
    section,
    response,
    previousSection,
    nextSection,
  };

  return (
    <div className="survey-section-wrapper">
      <SurveyMessage survey={survey} />
      <div className="survey-section">
        <SurveyNav
          survey={response.survey}
          response={response}
          // Not actually used in SurveyNav
          //currentSectionNumber={sectionNumber}
        />
        <div className="section-contents">
          <SurveyHeadTags survey={survey} />
          {loading ? (
            <Components.Loading />
          ) : !response ? (
            <p>Could not find survey.</p>
          ) : (
            <SurveySectionContents survey={survey} {...sectionProps} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveySection;
