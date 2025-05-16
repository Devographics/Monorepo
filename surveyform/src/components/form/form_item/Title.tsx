import Form from "react-bootstrap/Form";
import { T, useI18n } from "@devographics/react-i18n";
import { useQuestionTitle } from "~/lib/surveys/helpers/useQuestionTitle";
import AddToList from "~/components/reading_list/AddToList";
import QuestionLabel from "../QuestionLabel";

import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { SectionMetadata } from "@devographics/types";
import { FormItemProps } from "./Item";

export const FormItemTitle = (
  props: FormItemProps & { section: SectionMetadata }
) => {
  const { question, enableReadingList, section } = props;
  const { t } = useI18n();
  const { yearAdded } = question;

  const { tClean: label } = useQuestionTitle({ section, question });

  const currentYear = new Date().getFullYear();
  return (
    <legend className="form-label-legend">
      <h3 className="form-label-heading" id={question.id}>
        <Form.Label>
          <QuestionLabel section={section} question={question} />

          {yearAdded === currentYear && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="general.newly_added">
                  <T token="general.newly_added" />
                </Tooltip>
              }
            >
              <span
                className="question-label-new"
                title={t("general.newly_added")}
              >
                {yearAdded}
              </span>
            </OverlayTrigger>
          )}
        </Form.Label>

        {enableReadingList && question.entity && (
          <AddToList {...props} label={label || ""} id={question.id} />
        )}

        {/* <span className="form-label-number">
          {sectionNumber}.{questionNumber}
        </span> */}
      </h3>
    </legend>
  );
};
