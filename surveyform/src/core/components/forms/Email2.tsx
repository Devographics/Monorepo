import React, { useState } from "react";
import { useIntlContext } from "@vulcanjs/react-i18n";
import {
  FormInputProps,
  useVulcanComponents,
  useFormContext,
} from "@vulcanjs/react-ui";
import { FormCheck, FormControl } from "react-bootstrap";
import isEmpty from "lodash/isEmpty.js";

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
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  const [showEmail, setShowEmail] = useState(checkboxValue);
  const { updateCurrentValues } = useFormContext();

  const email = localStorage && localStorage.getItem("email");
  if (email && isEmpty(inputProperties.value)) {
    inputProperties.value = email;
  }

  return (
    <Components.FormItem path={path} label={label} {...itemProperties}>
      <FormCheck
        name="show_email"
        label={intl.formatMessage({ id: `options.${questionId}.yes` })}
        checked={showEmail}
        type="checkbox"
        onClick={(event) => {
          setShowEmail(!showEmail);
          updateCurrentValues({ [checkboxPath]: !showEmail });
        }}
      />
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
    </Components.FormItem>
  );
};

export default Email2;
