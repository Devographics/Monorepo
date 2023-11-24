"use client";
import { useRef, useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import { FormattedMessage } from "~/components/common/FormattedMessage";

import { useIntlContext } from "@devographics/react-i18n";
import debounce from "lodash/debounce.js";
import IconComment from "~/components/icons/Comment";
import IconCommentDots from "~/components/icons/CommentDots";
import { FormInputProps } from "./typings";
import { getOptioni18nIds } from "~/i18n/survey";
import isEmpty from "lodash/isEmpty";
import { useFormStateContext } from "./FormStateContext";

export const CommentTrigger = ({
  value,
  showCommentInput = false,
  setShowCommentInput,
}) => {
  const isActive = showCommentInput || !!value;
  const intl = useIntlContext();
  const target = useRef(null);

  return (
    <div className="comment-trigger-wrapper">
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="">
            <FormattedMessage id="experience.leave_comment_short" />
          </Tooltip>
        }
      >
        <button
          ref={target}
          className={`comment-trigger comment-trigger-${
            isActive ? "active" : "inactive"
          }`}
          type="button"
          aria-describedby="popover-basic"
          aria-label={intl.formatMessage({ id: "experience.leave_comment" })}
          onClick={() => {
            setShowCommentInput(!showCommentInput);
          }}
        >
          {value ? <IconCommentDots /> : <IconComment />}
          <span className="visually-hidden">
            <FormattedMessage id="experience.leave_comment" />
          </span>
        </button>
      </OverlayTrigger>
    </div>
  );
};

interface CommentInputProps extends FormInputProps {
  commentPath: string;
  commentValue: string;
}

export const CommentInput = (props: CommentInputProps) => {
  const intl = useIntlContext();
  const {
    commentPath,
    commentValue,
    value: questionValue,
    question,
    readOnly,
  } = props;

  const hasQuestionValue =
    typeof questionValue === "number" || !isEmpty(questionValue);

  let translatedAnswer: string | undefined;
  const option = question.options?.find((o) => o.id === questionValue);
  const i18n = option && getOptioni18nIds({ ...props, option });
  translatedAnswer = i18n && intl.formatMessage({ id: i18n.base });

  return (
    <div className="comment-input">
      <h5 className="comment-input-heading">
        <FormattedMessage id="experience.leave_comment" />
      </h5>
      <p className="comment-input-subheading">
        {hasQuestionValue ? (
          translatedAnswer ? (
            <FormattedMessage
              id="experience.tell_us_more"
              values={{ response: translatedAnswer }}
            />
          ) : (
            <FormattedMessage id="experience.tell_us_more_generic" />
          )
        ) : (
          <FormattedMessage id="experience.tell_us_more_no_value" />
        )}
      </p>
      <CommentTextarea
        readOnly={!!readOnly}
        value={commentValue}
        path={commentPath}
      />
    </div>
  );
};

export const CommentTextarea = ({
  readOnly,
  value,
  path,
  placeholder,
}: {
  readOnly: boolean;
  value: string;
  path: string;
  placeholder?: string;
}) => {
  const [localValue, setLocalValue] = useState(value);

  const { updateCurrentValues } = useFormStateContext();

  const updateCurrentValuesDebounced = debounce(updateCurrentValues, 500);

  const handleChange =
    (isDebounced = false) =>
    (event) => {
      let value = event.target.value;
      setLocalValue(value);
      const _updateCurrentValues = isDebounced
        ? updateCurrentValuesDebounced
        : updateCurrentValues;
      if (value === "") {
        // @ts-ignore
        _updateCurrentValues({ [path]: null });
      } else {
        // @ts-ignore
        _updateCurrentValues({ [path]: value });
      }
    };

  return (
    <FormControl
      as="textarea"
      onChange={handleChange(true)}
      onBlur={handleChange(false)}
      value={localValue || ""}
      disabled={readOnly}
      placeholder={placeholder}
      // ref={refFunction}
      // {...inputProperties}
    />
  );
};
