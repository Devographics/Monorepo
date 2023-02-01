"use client";
import React, { useState } from "react";
import { useIntlContext } from "@devographics/react-i18n";
import { FormInputProps, useFormContext } from "@devographics/react-form";
import { FormControl } from "react-bootstrap";
import isEmpty from "lodash/isEmpty.js";
import { Form } from "react-bootstrap";
import FormOptionLabel from "~/form/components/elements/FormOptionLabel";
import { FormItem } from "~/form/components/elements/FormItem";

const receiveNotificationsFieldName = "receive_notifications";

export const Email2 = ({
  document,
  path,
  label,
  refFunction,
  inputProperties = {},
  itemProperties = {},
}: FormInputProps) => {
  const { questionId } = itemProperties;
  const checkboxPath = path.replace(questionId, receiveNotificationsFieldName);
  const checkboxValue = document[checkboxPath];
  const intl = useIntlContext();
  const [showEmail, setShowEmail] = useState(checkboxValue);
  const { updateCurrentValues } = useFormContext();

  const email = localStorage && localStorage.getItem("email");
  if (email && isEmpty(inputProperties.value)) {
    inputProperties.value = email;
  }

  const yesLabel = intl.formatMessage({ id: `options.${questionId}.yes` });

  return (
    <FormItem path={path} label={label} {...itemProperties}>
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
            <FormOptionLabel option={{ label: yesLabel }} />
          </div>
        </Form.Check.Label>
      </Form.Check>

      {showEmail && (
        <div>
          {/* @ts-ignore */}
          <FormControl
            {...inputProperties}
            placeholder={intl.formatMessage({ id: "user_info.email" })}
            ref={refFunction}
            type="email"
          />
        </div>
      )}
    </FormItem>
  );
};

export default Email2;
