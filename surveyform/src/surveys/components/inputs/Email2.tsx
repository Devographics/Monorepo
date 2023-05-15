"use client";
import React, { useState } from "react";
import { useIntlContext } from "@devographics/react-i18n";
import { FormInputProps } from "~/surveys/components/form/typings";
import { useFormContext } from "~/surveys/components/form/FormContext";

import FormControl from "react-bootstrap/FormControl";

import isEmpty from "lodash/isEmpty.js";
import Form from "react-bootstrap/Form";

import FormOption from "~/surveys/components/form/FormOption";
import { FormItem } from "~/surveys/components/form/FormItem";

const receiveNotificationsFieldName = "receive_notifications";

export const Email2 = (props: FormInputProps) => {
  const {
    response,
    path,
    question,
    value: value_,
    updateCurrentValues,
  } = props;

  const { id: questionId } = question;
  const checkboxPath = path.replace(questionId, receiveNotificationsFieldName);
  const checkboxValue = document[checkboxPath];
  const intl = useIntlContext();
  const [showEmail, setShowEmail] = useState(checkboxValue);

  const email = localStorage && localStorage.getItem("email");
  const value = email && isEmpty(value_) ? email : (value_ as string);

  const yesLabel = intl.formatMessage({ id: `options.${questionId}.yes` });

  return (
    <FormItem {...props}>
      {/* <FormCheck
        name="show_email"
        label={intl.formatMessage({ id: `options.${questionId}.yes` })}
        checked={showEmail}
        type="checkbox"
        onClick={(event) => {
          setShowEmail(!showEmail);
          updateCurrentValues({ [checkboxPath]: !showEmail });
        }}
      /> */}
      <Form.Check name="show_email" label={yesLabel}>
        <Form.Check.Label htmlFor="show_email">
          <div className="form-input-wrapper">
            <Form.Check.Input
              id="show_email"
              checked={showEmail}
              type="checkbox"
              onChange={(event) => {
                setShowEmail(!showEmail);
                updateCurrentValues({ [checkboxPath]: !showEmail });
              }}
            />
          </div>
          <div className="form-option">
            <FormOption {...props} option={{ id: "email", label: yesLabel }} />
          </div>
        </Form.Check.Label>
      </Form.Check>

      {showEmail && (
        <div>
          {/* @ts-ignore */}
          <FormControl
            placeholder={intl.formatMessage({ id: "user_info.email" })}
            type="email"
            value={value}
          />
        </div>
      )}
    </FormItem>
  );
};

export default Email2;
