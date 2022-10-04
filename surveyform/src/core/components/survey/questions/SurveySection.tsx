/*

1. Look for responseId and section number in URL params
2. Load response from server using withSingle2 HoC
3. Display response form restricted to questions of current section via `fields` prop

Note: form has a customized "FormSubmit" component to show the prev/next buttons

*/
import React from "react";
import SurveySectionContents from "./SurveySectionContents";
import SurveyHeadTags from "../SurveyHeadTags";
import SurveyMessage from "../SurveyMessage";
import { useSurveyResponseParams } from "../hooks";
import { useSingle } from "@vulcanjs/react-hooks";
import { Response } from "~/modules/responses/model";
import { SurveyResponseFragment } from "~/modules/responses/fragments";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { getFragmentName } from "@vulcanjs/graphql";
import surveys from "~/surveys";

const SurveySection = () => {
  const Components = useVulcanComponents();
  let {
    responseId,
    sectionNumber = 1,
    slug,
    year,
    paramsReady,
  } = useSurveyResponseParams();
  // TODO: use a "SurveyContext" that is populated at layout level with the
  // current survey, and use "useCurrentSurvey"
  // This needs to wait for the incoming layout update of Next.js
  const survey = surveys.find(
    (s) => s.prettySlug === slug && s.year === Number(year)
  );
  // const { document: response, loading } = useSingle({
  //   model: Response,
  //   fragment: survey && SurveyResponseFragment(survey),
  //   fragmentName: survey && getFragmentName(SurveyResponseFragment(survey)),
  //   input: { id: responseId },
  //   queryOptions: {
  //     pollInterval: 0,
  //     skip: !survey,
  //   },
  // });

  if (!paramsReady) {
    return <div>Loading section…</div>;
  }

  if (!survey) throw new Error(`Survey with slug ${slug} not found`);

  // if (!response) {
  //   return (
  //     <div>
  //       Could not find survey response document. Please reload, or if that
  //       doesn’t work{" "}
  //       <a href="https://github.com/devographics/monorepo/issues">
  //         leave an issue
  //       </a>
  //       .
  //     </div>
  //   );
  // }

  //const survey = surveys.find((s) => s.slug === response.survey.slug);
  const surveyOutline = survey.outline;
  const sectionIndex = sectionNumber - 1;
  const section = surveyOutline[sectionIndex];
  const previousSection = surveyOutline[sectionIndex - 1];
  const nextSection = surveyOutline[sectionIndex + 1];
  const sectionProps = {
    sectionNumber,
    section,
    // response,
    responseId,
    previousSection,
    nextSection,
  };

  return (
    <div className="survey-section-wrapper">
      <SurveyMessage survey={survey} />
      <SurveyHeadTags survey={survey} />
      <SurveySectionContents survey={survey} {...sectionProps} />
    </div>
  );
};

export default SurveySection;
