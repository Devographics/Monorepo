"use client";
import { useI18n } from "@devographics/react-i18n";
import type { FormInputProps } from "~/components/form/typings";
import { FormItem } from "~/components/form/FormItem";
import { getOptioni18nIds } from "~/lib/i18n/survey";
import { FormSelect } from "../form/FormSelect";

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
  const { t, getMessage } = useI18n();
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
      <FormSelect
        onChange={(e) => {
          updateCurrentValues({ [path]: e.currentTarget.value });
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
          const optionLabel = getMessage(i18n.base, {}, label)?.t;
          return (
            <option key={id} value={id}>
              {optionLabel}
            </option>
          );
        })}
      </FormSelect>
    </FormItem>
  );
};

export default FormComponentSelect;
