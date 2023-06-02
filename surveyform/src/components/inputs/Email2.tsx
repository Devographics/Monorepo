"use client";
import { useState } from "react";
import { useIntlContext } from "@devographics/react-i18n";
import { FormInputProps } from "~/components/form/typings";

import FormControl from "react-bootstrap/FormControl";

import isEmpty from "lodash/isEmpty.js";
import Form from "react-bootstrap/Form";

import FormOption from "~/components/form/FormOption";
import { FormItem } from "~/components/form/FormItem";
import debounce from "lodash/debounce.js";

export const Email2 = (props: FormInputProps) => {
  const { response, question, updateCurrentValues, readOnly } = props;

  const { id: questionId } = question;
  const checkboxValue = response?.receiveNotifications;
  const intl = useIntlContext();

  const localStorageEmail =
    typeof localStorage !== "undefined" && localStorage.getItem("email");
  const responseEmail = response?.email;
  // const value = localStorageEmail && isEmpty(responseEmail) ? localStorageEmail : (responseEmail as string);
  const value = localStorageEmail || responseEmail;

  const [receiveNotifications, setReceiveNotifications] =
    useState(checkboxValue);

  // keep track of "other" field value locally
  const [localValue, setLocalValue] = useState(value);

  const handler = (event, updateFunction) => {
    const value = event.target.value;
    setLocalValue(value);
    updateFunction({ email: value });
    localStorage && localStorage.setItem("email", value);
  };

  const handleChange = (event) => {
    handler(event, updateCurrentValues);
  };
  const handleChangeDebounced = (event) => {
    handler(event, debounce(updateCurrentValues, 500));
  };

  return (
    <FormItem {...props}>
      <Form.Check name="show_email">
        <Form.Check.Label htmlFor="show_email">
          <div className="form-input-wrapper">
            <Form.Check.Input
              id="show_email"
              checked={receiveNotifications}
              type="checkbox"
              onChange={(event) => {
                setReceiveNotifications(!receiveNotifications);
                updateCurrentValues({
                  receiveNotifications: !receiveNotifications,
                });
              }}
            />
          </div>
          <div className="form-option">
            <FormOption {...props} option={{ id: "yes" }} />
          </div>
        </Form.Check.Label>
      </Form.Check>

      {receiveNotifications && (
        <div>
          {/* @ts-ignore */}
          <FormControl
            placeholder={intl.formatMessage({ id: "user_info.email" })}
            type="email"
            value={localValue}
            onChange={handleChangeDebounced}
            onBlur={handleChange}
            disabled={readOnly}
          />
        </div>
      )}
    </FormItem>
  );
};

export default Email2;
