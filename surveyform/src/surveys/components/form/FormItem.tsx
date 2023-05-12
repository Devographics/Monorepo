/*

Layout for a single form item

*/
"use client";
import { ReactNode, useState } from "react";
import get from "lodash/get.js";

import { useIntlContext } from "@devographics/react-i18n";
import Form from "react-bootstrap/Form";
import { FormInputLoading } from "./FormInputLoading";
import { FormInputProps } from "./typings";
import { CommentTrigger, CommentInput } from "./FormComment";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

import { EntityLabel } from "~/core/components/common/EntityLabel";

interface FormItemProps extends FormInputProps {
  children: ReactNode;
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
    value,
    question,
    updateCurrentValues,
    isFirstQuestion,
  } = props;

  const { options, formPaths, entity } = question;

  const commentPath = formPaths.comment;
  const commentValue = get(response, commentPath);

  // open the comment widget if there is already a comment
  const [showCommentInput, setShowCommentInput] = useState(!!commentValue);

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

        <CommentTrigger
          value={commentValue}
          showCommentInput={showCommentInput}
          setShowCommentInput={setShowCommentInput}
          isFirstQuestion={isFirstQuestion}
        />
        {showCommentInput && (
          <CommentInput
            {...props}
            commentPath={commentPath}
            commentValue={commentValue}
            // questionLabel={inputProperties.label}
            // questionEntity={entity}
            // questionValue={value}
            // questionOptions={options}
            // questionPath={path}
          />
        )}
      </div>
    </Form.Group>
  );
};

export const FormItemTitle = ({ section, question }: FormInputProps) => {
  const intl = useIntlContext();
  const { entity, yearAdded, intlId: intlIdOverride } = question;

  const intlId = intlIdOverride ?? `${section.id}.${question.id}`;

  return (
    <h3 className="form-label-heading">
      <Form.Label>
        {entity ? (
          <span
            className="entity-label"
            dangerouslySetInnerHTML={{
              __html: entity.nameHtml || entity.nameClean || entity.name,
            }}
          />
        ) : (
          <FormattedMessage id={intlId} defaultMessage={question.id} />
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
    </h3>
  );
};

export const FormItemDescription = ({ section, question }: FormInputProps) => {
  const intl = useIntlContext();
  const intlId = `${section.id}.${question.id}.description`;
  const description = intl.formatMessage({ id: intlId });
  return description ? (
    <FormattedMessage className="form-description" id={intlId} />
  ) : null;
};

export const FormItemNote = ({ section, question }: FormInputProps) => {
  const intl = useIntlContext();
  const intlId = `${section.id}.${question.id}.note`;
  const note = intl.formatMessage({ id: intlId });
  return note ? <FormattedMessage className="form-note" id={intlId} /> : null;
};
