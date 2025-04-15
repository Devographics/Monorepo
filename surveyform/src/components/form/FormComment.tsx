"use client";
import { useRef, useState } from "react";
import FormControl from "react-bootstrap/FormControl";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import { T, useI18n } from "@devographics/react-i18n";
import debounce from "lodash/debounce.js";
import IconComment from "~/components/icons/Comment";
import IconCommentDots from "~/components/icons/CommentDots";
import { FormInputProps } from "./typings";
import { getOptioni18nIds, getQuestioni18nIds } from "~/lib/i18n/survey";
import isEmpty from "lodash/isEmpty";
import { useFormStateContext } from "./FormStateContext";

export const CommentTrigger = ({
  value,
  showCommentInput = false,
  setShowCommentInput,
}) => {
  const isActive = showCommentInput || !!value;
  const { t } = useI18n();
  const target = useRef(null);

  return (
    <div className="comment-trigger-wrapper">
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="">
            <T token="experience.leave_comment_short" />
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
          aria-label={t("experience.leave_comment")}
          onClick={() => {
            setShowCommentInput(!showCommentInput);
          }}
        >
          {value ? <IconCommentDots /> : <IconComment />}
          <span className="visually-hidden">
            <T token="experience.leave_comment" />
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
  const { t, getMessage } = useI18n();
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
  translatedAnswer = i18n && t(i18n.base);

  const intlIds = getQuestioni18nIds(props);
  const customCommentPrompt = getMessage(intlIds.commentPrompt);
  const hasCustomPrompt = !customCommentPrompt.missing;

  return (
    <div className="comment-input">
      <h5 className="comment-input-heading">
        <T token="experience.leave_comment" />
      </h5>
      <p className="comment-input-subheading">
        {hasCustomPrompt ? (
          <T token={intlIds.commentPrompt} />
        ) : hasQuestionValue ? (
          translatedAnswer ? (
            <T
              token="experience.tell_us_more"
              values={{ response: translatedAnswer }}
            />
          ) : (
            <T token="experience.tell_us_more_generic" />
          )
        ) : (
          <T token="experience.tell_us_more_no_value" />
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
