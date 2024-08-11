"use client";
import { useI18n } from "@devographics/react-i18n";
import type { FormInputProps } from "~/components/form/typings";
import Form from "react-bootstrap/Form";
import { FormItem } from "~/components/form/FormItem";
import { getOptioni18nIds } from "~/i18n/survey";

export const FormComponentSelect = (props: FormInputProps) => {
  const {
    survey,
    edition,
    section,
    path,
    value,
    question,
    updateCurrentValues,
    readOnly,
  } = props;
  const { options, optionsAreNumeric } = question;
  const { t } = useI18n();
  const emptyValue = "";
  const noneOption = {
    label: t("forms.select_option"),
    id: emptyValue,
    disabled: true,
  };
  let otherOptions = Array.isArray(options) && options.length ? options : [];
  const allOptions = [noneOption, ...otherOptions];
  return (
    <FormItem {...props}>
      <Form.Select
        // ref={refFunction}
        // defaultValue={emptyValue}
        onChange={(e) => {
          updateCurrentValues({ [path]: e.target.value });
        }}
        disabled={readOnly}
        value={value ? value.toString() : emptyValue}
      >
        {allOptions.map((option) => {
          const { id, label } = option;
          const i18n = getOptioni18nIds({
            question,
            option,
          });
          const optionLabel =
            label ||
            t(i18n.base);
          return (
            <option key={id} value={id}>
              {optionLabel}
            </option>
          );
        })}
      </Form.Select>
    </FormItem>
  );
};

export default FormComponentSelect;
