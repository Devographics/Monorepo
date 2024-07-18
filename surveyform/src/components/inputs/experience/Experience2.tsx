"use client";
import { FormItem } from "~/components/form/FormItem";
import Form from "react-bootstrap/Form";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import { FormattedMessage } from "~/components/common/FormattedMessage";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";

import isEmpty from "lodash/isEmpty.js";
import { Dispatch, SetStateAction, useState } from "react";
import {
  DbPathsEnum,
  Example,
  FeaturesOptions,
  OptionMetadata,
} from "@devographics/types";
import { getFormPaths } from "@devographics/templates";

import get from "lodash/get.js";
import { FollowupData, /*FollowUpComment,*/ FollowUps } from "./Followup2";
// import { CommentTrigger } from "~/components/form/FormComment";
import { useIntlContext } from "@devographics/react-i18n-legacy";

import Alert from "react-bootstrap/Alert";
import { useFormPropsContext } from "~/components/form/FormPropsContext";
import { useFormStateContext } from "~/components/form/FormStateContext";

export interface ExperienceProps extends FormInputProps {
  showDescription: boolean;
}

const unimplementedFeatures = [
  "selectlist_element",
  "accordion_element",
  "focusgroup_attribute",
  "dom_parts",
  "model_element",
  "html_modules",
  "scoped_element_registries",
  "isolated_webapps",
];

export const Experience2 = (props: ExperienceProps) => {
  const { edition } = useFormPropsContext();
  const { question } = props;

  const [highlightReadingList, setHighlightReadingList] = useState(false);

  const { options, entity } = question;

  const className = highlightReadingList
    ? "form-item-reading-list-highlighted"
    : "";

  return (
    <FormItem {...props} className={className}>
      {entity?.example && <CodeExample {...entity.example} />}
      <div className="experience-contents">
        <div className="experience-options">
          {options?.map((option, i) => (
            <ExperienceOption
              key={i}
              option={option}
              i={i}
              {...props}
              highlightReadingList={highlightReadingList}
              setHighlightReadingList={setHighlightReadingList}
            />
          ))}
        </div>
      </div>
    </FormItem>
  );
};

export const CodeExample = ({
  language,
  label,
  code,
  codeHighlighted,
}: Example) => {
  return (
    <div className="code-example">
      <h5 className="code-example-heading">
        {label || language || <FormattedMessage id="general.code_example" />}{" "}
      </h5>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: codeHighlighted }}></code>
      </pre>
    </div>
  );
};

type ExperienceOptionProps = ExperienceProps & {
  option: OptionMetadata;
  i: number;
  highlightReadingList: boolean;
  setHighlightReadingList: Dispatch<SetStateAction<boolean>>;
};

const ExperienceOption = (props: ExperienceOptionProps) => {
  const {
    i,
    question,
    option,
    path,
    value,
    highlightReadingList,
    setHighlightReadingList,
  } = props;
  const { edition, readOnly } = useFormPropsContext();
  const { response, updateCurrentValues } = useFormStateContext();
  const hasValue = !isEmpty(value);
  const { followups } = question;

  const [showReadingListPrompt, setShowReadingListPrompt] = useState(false);

  const formPaths = getFormPaths({ edition, question });

  // get the paths of the predefined and freeform followup answers
  // inside the overall response document for this specific option
  const allPredefinedFollowupPaths = formPaths[DbPathsEnum.FOLLOWUP_PREDEFINED];
  const predefinedFollowupPath = allPredefinedFollowupPaths?.[option.id];
  const freeformFollowupPath =
    formPaths[DbPathsEnum.FOLLOWUP_FREEFORM]?.[option.id];

  const predefinedFollowupValue =
    (predefinedFollowupPath && get(response, predefinedFollowupPath)) || [];
  const freeformFollowupValue =
    (freeformFollowupPath && get(response, freeformFollowupPath)) || "";

  const hasFollowupData =
    !isEmpty(predefinedFollowupValue) || !isEmpty(freeformFollowupValue);
  // const [showFollowupComment, setShowFollowupComment] =
  // useState(hasFollowupData);

  const followupData: FollowupData = {
    predefinedFollowupPath,
    freeformFollowupPath,
    predefinedFollowupValue,
    freeformFollowupValue,
  };

  const isChecked = value === option.id;
  const checkClass = hasValue
    ? isChecked
      ? "form-check-checked"
      : "form-check-unchecked"
    : "";

  const hasValueClass =
    isChecked || (isChecked && hasFollowupData) ? "hasValue" : "";

  const unimplemented =
    option.id === FeaturesOptions.USED &&
    unimplementedFeatures.includes(question.id);

  const unimplementedClass = unimplemented
    ? "form-experience-option-unimplemented"
    : "";

  return (
    <div
      className={`form-experience-option ${hasValueClass} ${unimplementedClass}`}
    >
      <div className="form-experience-option-inner">
        <Form.Check
          key={i}
          // layout="elementOnly"
          type="radio"
        >
          <Form.Check.Label htmlFor={`${path}.${i}`}>
            <div className="form-input-wrapper">
              <Form.Check.Input
                onClick={(e) => {
                  const target = e.target as HTMLInputElement;
                  const clickedValue = target.value;
                  if (clickedValue === value) {
                    updateCurrentValues({ [path]: null });
                  }
                }}
                onChange={(e) => {
                  updateCurrentValues({ [path]: e.target.value });
                  if (allPredefinedFollowupPaths) {
                    // when main value changes, also clear all predefined follow-ups
                    for (const followUpPath of Object.values(
                      allPredefinedFollowupPaths,
                    )) {
                      updateCurrentValues({ [followUpPath]: null });
                    }
                  }
                }}
                type="radio"
                value={option.id}
                name={path}
                id={`${path}.${i}`}
                // ref={refFunction}
                checked={isChecked}
                className={checkClass}
                disabled={readOnly}
              />
            </div>
            <FormOption {...props} isChecked={isChecked} option={option} />
          </Form.Check.Label>
          {unimplemented && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`${question.id}_unimplemented_tooltip`}>
                  <FormattedMessage id="feature.unimplemented.description" />
                </Tooltip>
              }
            >
              <span
                className="feature-unimplemented"
                aria-describedby={`${question.id}_unimplemented_tooltip`}
              >
                <FormattedMessage id="feature.unimplemented" />
              </span>
            </OverlayTrigger>
          )}
          {followups && (
            <FollowUps
              {...props}
              parentHasValue={hasValue}
              optionIsChecked={isChecked}
              followupData={followupData}
              highlightReadingList={highlightReadingList}
              setHighlightReadingList={setHighlightReadingList}
              showReadingListPrompt={showReadingListPrompt}
              setShowReadingListPrompt={setShowReadingListPrompt}
              formPaths={formPaths}
            />
          )}
        </Form.Check>
        {/* <CommentTrigger /> */}
      </div>
      {showReadingListPrompt && (
        <ReadingListPrompt setHighlightReadingList={setHighlightReadingList} />
      )}
      {/* {showFollowupComment && isChecked && (
        <FollowUpComment {...props} followupData={followupData} />
      )} */}
    </div>
  );
};

export const ReadingListPrompt = ({ setHighlightReadingList }) => {
  const intl = useIntlContext();
  const optionLabel = intl.formatMessage({
    id: "followups.sentiment_interested",
  })?.t;
  return (
    <Alert
      variant="warning"
      dismissible
      onClose={() => {
        setHighlightReadingList(false);
      }}
    >
      <div className="reading-list-prompt">
        <FormattedMessage
          id="readinglist.prompt"
          values={{ option: optionLabel }}
        />
      </div>
    </Alert>
  );
};

export default Experience2;
