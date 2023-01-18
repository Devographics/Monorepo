"use client";
import React, { useState, useRef } from "react";
import { Overlay, Tooltip } from "react-bootstrap";
import { FormItem } from "~/form/components/elements/FormItem";
import FormOptionLabel from "~/form/components/elements/FormOptionLabel";
import { Form } from "react-bootstrap";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
// import { isOtherValue, removeOtherMarker, addOtherMarker } from './Checkboxgroup';
import { FormInputProps, useFormContext } from "@devographics/react-form";
import { useEntities } from "~/core/components/common/EntitiesContext";
import { FormControl } from "react-bootstrap";
import get from "lodash/get.js";
import IconComment from "~/core/components/icons/Comment";
import IconCommentDots from "~/core/components/icons/CommentDots";
import { useIntlContext } from "@vulcanjs/react-i18n";
import isEmpty from "lodash/isEmpty.js";
import debounce from "lodash/debounce.js";
import { getCommentFieldName } from "~/modules/surveys/helpers";

interface ExperienceProps extends FormInputProps {
  showDescription: boolean;
}

export const Experience = (props: ExperienceProps) => {
  const {
    refFunction,
    path,
    inputProperties,
    itemProperties = {},
    document,
    showDescription,
  } = props;
  const { isFirstQuestion, questionId } = itemProperties;

  const commentPath = getCommentFieldName(path);
  const commentValue = get(document, commentPath);

  const {
    // @ts-expect-error
    options = [],
    value,
    onChange,
    as,
    ...otherInputProperties
  } = inputProperties;
  const hasValue = !isEmpty(value);

  // open the comment widget if there is already a comment
  const [showCommentInput, setShowCommentInput] = useState(!!commentValue);

  const entities = useEntities();
  const entity = entities?.find((e) => e.id === questionId);

  return (
    <FormItem
      path={/*inputProperties.*/ path}
      label={inputProperties.label}
      showDescription={showDescription}
      {...itemProperties}
    >
      {entity?.example && <CodeExample {...entity.example} />}
      <div className="experience-contents">
        <div className="experience-options">
          {options.map((option, i) => {
            const isChecked = value === option.value;
            const checkClass = hasValue
              ? isChecked
                ? "form-check-checked"
                : "form-check-unchecked"
              : "";
            return (
              // @ts-ignore
              <Form.Check
                {...otherInputProperties}
                key={i}
                // layout="elementOnly"
                type="radio"
              >
                <Form.Check.Label htmlFor={`${path}.${i}`}>
                  <div className="form-input-wrapper">
                    <Form.Check.Input
                      {...otherInputProperties}
                      onChange={onChange}
                      type="radio"
                      value={option.value}
                      name={path}
                      id={`${path}.${i}`}
                      // path={`${path}.${i}`}
                      ref={refFunction}
                      checked={isChecked}
                      className={checkClass}
                    />
                  </div>
                  <div className="form-option">
                    <FormOptionLabel option={option} />
                  </div>
                </Form.Check.Label>
              </Form.Check>
            );
          })}
        </div>

        <CommentTrigger
          value={commentValue}
          showCommentInput={showCommentInput}
          setShowCommentInput={setShowCommentInput}
          isFirstQuestion={isFirstQuestion}
        />
      </div>
      {showCommentInput && (
        <CommentInput
          path={commentPath}
          value={commentValue}
          questionLabel={inputProperties.label}
          questionEntity={entity}
          questionValue={value}
          questionOptions={options}
          questionPath={path}
        />
      )}
    </FormItem>
  );
};

const CodeExample = ({ language, code, codeHighlighted }) => {
  return (
    <div className="code-example">
      <h5 className="code-example-heading">
        <FormattedMessage id="general.code_example" />
      </h5>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: codeHighlighted }}></code>
      </pre>
    </div>
  );
};

const CommentTrigger = ({
  value,
  showCommentInput,
  setShowCommentInput,
  isFirstQuestion = false,
}) => {
  const [show, setShow] = useState(isFirstQuestion);

  const isActive = showCommentInput || !!value;
  const intl = useIntlContext();
  const target = useRef(null);

  return (
    <div className="comment-trigger-wrapper">
      <button
        ref={target}
        className={`comment-trigger comment-trigger-${
          isActive ? "active" : "inactive"
        }`}
        type="button"
        aria-describedby="popover-basic"
        aria-label={intl.formatMessage({ id: "experience.leave_comment" })}
        title={intl.formatMessage({ id: "experience.leave_comment" })}
        onClick={() => {
          setShowCommentInput(!showCommentInput);
        }}
        onMouseOver={() => {
          setShow(true);
        }}
        onMouseOut={() => {
          setShow(false);
        }}
      >
        {value ? <IconCommentDots /> : <IconComment />}
        <span className="visually-hidden">
          <FormattedMessage id="experience.leave_comment" />
        </span>
      </button>
      <Overlay target={target.current} show={show} placement={"right"}>
        {(props) => (
          <Tooltip id="leave_comment" {...props}>
            <FormattedMessage id="experience.leave_comment_short" />
          </Tooltip>
        )}
      </Overlay>
    </div>
  );
};

const CommentInput = ({
  path,
  value,
  questionLabel,
  questionValue,
  questionOptions,
  questionEntity,
  questionPath,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const { getDocument, updateCurrentValues } = useFormContext();

  // if label has been translated, use that to override entity name
  const label =
    (questionLabel.toLowerCase() !== questionPath && questionLabel) ||
    questionEntity?.name;
  const response = questionOptions?.find(
    (o) => o.value === questionValue
  )?.label;

  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);

  const handleChange =
    (isDebounced = false) =>
    (event) => {
      let value = event.target.value;
      setLocalValue(value);
      const f = isDebounced
        ? updateCurrentValuesDebounced
        : updateCurrentValues;
      if (value === "") {
        f({ [path]: null });
      } else {
        f({ [path]: value });
      }
    };

  return (
    <div className="comment-input">
      <h5 className="comment-input-heading">
        <FormattedMessage id="experience.leave_comment" values={{ label }} />
      </h5>
      <p className="comment-input-subheading">
        {questionValue ? (
          <FormattedMessage
            id="experience.tell_us_more"
            values={{ response }}
          />
        ) : (
          <FormattedMessage id="experience.tell_us_more_no_value" />
        )}
      </p>
      <FormControl
        as="textarea"
        onChange={handleChange(true)}
        onBlur={handleChange(false)}
        value={localValue}
        // ref={refFunction}
        // {...inputProperties}
      />
    </div>
  );
};

export default Experience;
