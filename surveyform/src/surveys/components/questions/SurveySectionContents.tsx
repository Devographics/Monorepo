"use client";
import { Loading } from "~/core/components/ui/Loading";
import { EditionMetadata, SurveyStatusEnum } from "@devographics/types";
import { useUserResponse } from "~/responses/hooks";
import { FormSection } from "../form/FormSection";

const SurveySectionContents = ({
  sectionNumber,
  section,
  responseId,
  previousSection,
  nextSection,
  readOnly: readOnlyRoute,
  edition,
}: {
  sectionNumber?: number;
  section?: any;
  responseId?: string;
  previousSection?: any;
  nextSection?: any;
  readOnly?: boolean;
  edition: EditionMetadata;
}) => {
  const {
    response,
    loading: responseLoading,
    error: responseError,
  } = useUserResponse({
    editionId: edition.id,
    surveyId: edition.survey.id,
  });

  if (responseLoading) {
    return <Loading />;
  }

  const questions = section.questions.filter((q) => !q.hidden);
  const fields = questions.map((question) => question?.formPaths?.response);

  // we need to tell SmartForm to accept the comment fields as valid fields too
  for (const f of section.questions) {
    if (f?.formPaths?.comment) {
      fields.push(f.formPaths.comment);
    }
  }

  const isLastSection = !nextSection;

  const formProps = {
    sectionNumber,
    response,
    section,
    edition,
    readOnly: readOnlyRoute || edition.status === SurveyStatusEnum.CLOSED,
  };
  return <FormSection {...formProps} />;
};

export default SurveySectionContents;
