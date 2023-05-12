"use client";
import { useState, useRef } from "react";
import Overlay from "react-bootstrap/Overlay";
import Tooltip from "react-bootstrap/Tooltip";
import FormControl from "react-bootstrap/FormControl";
import { FormItem } from "~/surveys/components/form/FormItem";
import Form from "react-bootstrap/Form";

import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { FormInputProps } from "~/surveys/components/form/typings";
import { useFormContext } from "~/surveys/components/form/FormContext";
import { FormOption } from "~/surveys/components/form/FormOption";

import get from "lodash/get.js";
import IconComment from "~/core/components/icons/Comment";
import IconCommentDots from "~/core/components/icons/CommentDots";
import { useIntlContext } from "@devographics/react-i18n";
import isEmpty from "lodash/isEmpty.js";
import debounce from "lodash/debounce.js";

interface ExperienceProps extends FormInputProps {
  showDescription: boolean;
}

export const Experience = (props: ExperienceProps) => {
  const {
    response,
    path,
    value,
    question,
    updateCurrentValues,
    isFirstQuestion,
  } = props;

  const { options, formPaths, entity } = question;

  const hasValue = !isEmpty(value);

  return (
    <FormItem {...props}>
      {entity?.example && <CodeExample {...entity.example} />}
      <div className="experience-contents">
        <div className="experience-options">
          {options?.map((option, i) => {
            const isChecked = value === option.id;
            const checkClass = hasValue
              ? isChecked
                ? "form-check-checked"
                : "form-check-unchecked"
              : "";
            return (
              // @ts-ignore
              <Form.Check
                key={i}
                // layout="elementOnly"
                type="radio"
              >
                <Form.Check.Label htmlFor={`${path}.${i}`}>
                  <div className="form-input-wrapper">
                    <Form.Check.Input
                      onChange={(e) => {
                        updateCurrentValues(path, e.target.value);
                      }}
                      type="radio"
                      value={option.id}
                      name={path}
                      id={`${path}.${i}`}
                      // ref={refFunction}
                      checked={isChecked}
                      className={checkClass}
                    />
                  </div>
                  <FormOption {...props} option={option} />
                </Form.Check.Label>
              </Form.Check>
            );
          })}
        </div>
      </div>
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

export default Experience;
