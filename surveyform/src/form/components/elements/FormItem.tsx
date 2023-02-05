/*

Layout for a single form item

*/

import React from "react";
import { Form } from "react-bootstrap";
import { FormDescription, FormDescriptionProps } from "./FormDescription";
import { FormLabel, FormLabelProps } from "./FormLabel";
import { FormInputLoading } from "./FormInputLoading";
import FormNote from "./FormNote";
import { useIntlContext } from "@devographics/react-i18n";
import { useEntities } from "~/core/components/common/EntitiesContext";

export interface FormItemProps
  extends FormLabelProps,
    Partial<FormDescriptionProps> {
  children?: any;
  beforeInput?: any;
  afterInput?: any;
  description?: string;
  loading?: boolean;
  intlKeys?: Array<string>;
  questionId: string;
  showDescription?: boolean;
  noteIntlId?: string;
}
export const FormItem = (props: FormItemProps) => {
  const {
    path,
    children,
    beforeInput,
    afterInput,
    description: intlDescription,
    loading,
    intlKeys = [],
    questionId,
    showDescription = true,
    noteIntlId: noteIntlId_,
  } = props;

  const entities = useEntities();
  const entity = entities?.find((e) => e.id === questionId);

  // const description =
  //   showDescription &&
  //   (intlDescription || entity?.descriptionHtml || entity?.description);

  const description = showDescription && intlDescription;

  const innerComponent = loading ? (
    <FormInputLoading loading={loading}>{children}</FormInputLoading>
  ) : (
    children
  );

  const intl = useIntlContext();
  const noteIntlId = noteIntlId_ || `${intlKeys[0]}.note`;
  const note = intl.formatMessage({ id: noteIntlId });

  return (
    <Form.Group controlId={path}>
      <FormLabel {...props} entity={entity} />
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
