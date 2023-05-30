"use client";
import { FormItem } from "~/components/form/FormItem";
import type { FormInputProps } from "~/components/form/typings";
import Form from "react-bootstrap/Form";
import { FormOption } from "~/components/form/FormOption";
import { useIntlContext } from "@devographics/react-i18n";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getOptioni18nIds } from "@devographics/i18n";

export const Slider = (props: FormInputProps) => {
  const { path, value, question, readOnly, updateCurrentValues } = props;
  const { options } = question;
  const hasValue = value !== "";
  const intl = useIntlContext();

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
            const optionLabel = intl.formatMessage({
              id: i18n.base,
            });
            return (
              <Form.Check key={i} type="radio">
                <Form.Check.Label htmlFor={`${path}.${i}`}>
                  <div className="form-input-wrapper">
                    <Form.Check.Input
                      type="radio"
                      value={option.id}
                      name={path}
                      id={`${path}.${i}`}
                      // ref={refFunction}
                      checked={isChecked}
                      className={checkClass}
                      onChange={(e) => {
                        updateCurrentValues({ [path]: e.target.value });
                      }}
                      disabled={readOnly}
                    />
                  </div>
                  {optionLabel && <FormOption {...props} option={option} />}
                </Form.Check.Label>
              </Form.Check>
            );
          })}
        </div>
      </div>
    </FormItem>
  );
};

export default Slider;
