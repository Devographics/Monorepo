"use client";
import { FormItem } from "~/components/form/FormItem";
import type { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";
import { useI18n } from "@devographics/react-i18n";
import { getOptioni18nIds } from "~/lib/i18n/survey";
import { FormCheck, FormCheckInput, FormCheckLabel } from "../form/FormCheck";

export const Slider = (props: FormInputProps) => {
  const { path, value, question, readOnly, updateCurrentValues } = props;
  const { options } = question;
  const hasValue = value !== "";
  const { t } = useI18n();
  return (
    <FormItem {...props}>
      <div className="form-slider">
        <div className="form-slider-options">
          {options?.map((option, i) => {
            const hasLabel = option.label && Number(option.label) !== option.id;
            const isChecked = value === option.id;
            const checkClass = hasValue
              ? isChecked
                ? "form-check-checked"
                : "form-check-unchecked"
              : "";
            const i18n = getOptioni18nIds({ question, option });
            const optionLabel = t(i18n.base);
            // TODO: we don't really use this label, we only use it
            // to check if there is a translation for this value
            return (
              <FormCheck key={i} type="radio">
                <FormCheckLabel htmlFor={`${path}.${i}`}>
                  <div className="form-input-wrapper">
                    <FormCheckInput
                      type="radio"
                      value={option.id}
                      name={path}
                      id={`${path}.${i}`}
                      checked={isChecked}
                      className={checkClass}
                      onChange={(e) => {
                        const val =
                          typeof option.id === "number"
                            ? parseInt(e.currentTarget.value)
                            : e.currentTarget.value;
                        updateCurrentValues({ [path]: val });
                      }}
                      disabled={readOnly}
                    />
                  </div>
                  {optionLabel ? (
                    <FormOption
                      {...props}
                      isChecked={isChecked}
                      option={option}
                    />
                  ) : (
                    <div className="form-option">
                      <div className="form-option-item">
                        <span className="form-option-label form-option-label-numeric">
                          {i + 1}
                        </span>
                      </div>
                    </div>
                  )}
                </FormCheckLabel>
              </FormCheck>
            );
          })}
        </div>
      </div>
    </FormItem>
  );
};

export default Slider;
