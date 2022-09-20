/*

Layout for a single form item

*/

import React from "react";
import Form from "react-bootstrap/Form";
import { FormDescription, FormDescriptionProps } from "./FormDescription";
import { FormLabel, FormLabelProps } from "./FormLabel";
import { FormInputLoading } from "./FormInputLoading";
import FormNote from "./FormNote";
import { useIntlContext } from "@vulcanjs/react-i18n";

export interface FormItemProps
  extends FormLabelProps,
    Partial<FormDescriptionProps> {
  children?: any;
  beforeInput?: any;
  afterInput?: any;
  description?: string;
  loading?: boolean;
  intlKeys?: Array<string>;
}
export const FormItem = (props: FormItemProps) => {
  const {
    path,
    children,
    beforeInput,
    afterInput,
    description,
    loading,
    intlKeys,
  } = props;

  const innerComponent = loading ? (
    <FormInputLoading loading={loading}>{children}</FormInputLoading>
  ) : (
    children
  );

  const intl = useIntlContext();
  const note =
    intlKeys?.length && intl.formatMessage({ id: `${intlKeys[0]}.note` });

  return (
    <Form.Group controlId={path}>
      <FormLabel {...props} />
      <div className="form-item-contents">
        {description && <FormDescription description={description} />}
        <div className="form-item-input">
          {beforeInput}
          {innerComponent}
          {afterInput}
        </div>
        {note && <FormNote note={note} />}
      </div>
    </Form.Group>
  );
};
