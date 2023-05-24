/*

Layout for a single form item

*/
"use client";
import { ReactNode, useState } from "react";
import get from "lodash/get.js";

import { useIntlContext } from "@devographics/react-i18n";
import Form from "react-bootstrap/Form";
import { FormInputProps } from "./typings";
import { CommentTrigger, CommentInput } from "./FormComment";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getQuestioni18nIds } from "@devographics/i18n";
import { getFormPaths } from "~/lib/surveys/helpers";
import AddToList from "../reading_list/AddToList";

export interface FormItemProps extends FormInputProps {
  children: ReactNode;
  enableLearnMore?: boolean;
}

export const FormItem = (props: FormItemProps) => {
  // const {
  //   path,
  //   children,
  //   beforeInput,
  //   afterInput,
  //   description: intlDescription,
  //   loading,
  //   intlKeys = [],
  //   questionId,
  //   showDescription = true,
  //   noteIntlId: noteIntlId_,
  // } = props;

  const {
    children,
    response,
    path,
    edition,
    question,
    isFirstQuestion,
    readOnly,
    enableLearnMore,
  } = props;

  const { allowComment } = question;

  const formPaths = getFormPaths({ edition, question });
  const commentPath = formPaths.comment;
  const commentValue = commentPath && get(response, commentPath);

  // open the comment widget if there is already a comment or this is the first question
  const [showCommentInput, setShowCommentInput] = useState(
    (!readOnly && isFirstQuestion) || !!commentValue
  );

  // const innerComponent = loading ? (
  //   <FormInputLoading loading={loading}>{children}</FormInputLoading>
  // ) : (
  //   children
  // );

  return (
    <Form.Group controlId={path}>
      <FormItemTitle {...props} />
      <div className="form-item-contents">
        <FormItemDescription {...props} />
        <div className="form-item-input">
          {/* {beforeInput} */}
          {children}
          {/* {afterInput} */}
        </div>
        <FormItemNote {...props} />

        {allowComment && (
          <CommentTrigger
            value={commentValue}
            showCommentInput={showCommentInput}
            setShowCommentInput={setShowCommentInput}
            isFirstQuestion={isFirstQuestion}
          />
        )}
        {allowComment && showCommentInput && commentPath && (
          <CommentInput
            {...props}
            commentPath={commentPath}
            commentValue={commentValue}
          />
        )}
      </div>
    </Form.Group>
  );
};

export const FormItemTitle = (props: FormItemProps) => {
  const { question, sectionNumber, questionNumber, enableLearnMore } = props;
  const intl = useIntlContext();
  const { entity, yearAdded } = question;
  const i18n = getQuestioni18nIds(props);

  const entityName =
    entity && (entity.nameHtml || entity.nameClean || entity.name);

  return (
    <h3 className="form-label-heading">
      <Form.Label>
        {entityName ? (
          <span
            className="entity-label"
            dangerouslySetInnerHTML={{
              __html: entityName,
            }}
          />
        ) : (
          <FormattedMessage id={i18n.base} defaultMessage={i18n.base} />
        )}
        {yearAdded === 2023 && (
          <span
            className="question-label-new"
            title={intl.formatMessage({ id: "general.newly_added" })}
          >
            {yearAdded}
          </span>
        )}
      </Form.Label>

      {enableLearnMore && <AddToList {...props} />}

      {/* <span className="form-label-number">
        {sectionNumber}.{questionNumber}
      </span> */}
    </h3>
  );
};

export const FormItemDescription = (props: FormItemProps) => {
  const intl = useIntlContext();
  const intlIds = getQuestioni18nIds(props);
  const description = intl.formatMessage({ id: intlIds.description });
  return description ? (
    <FormattedMessage className="form-description" id={intlIds.description} />
  ) : null;
};

export const FormItemNote = (props: FormItemProps) => {
  const intl = useIntlContext();
  const intlIds = getQuestioni18nIds(props);
  const note = intl.formatMessage({ id: intlIds.note });
  return note ? (
    <FormattedMessage className="form-note" id={intlIds.note} />
  ) : null;
};
