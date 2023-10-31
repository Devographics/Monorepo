"use client";
import Form from "react-bootstrap/Form";
import { FormInputProps } from "~/components/form/typings";
import { FormOption } from "~/components/form/FormOption";
import { FormItem } from "~/components/form/FormItem";
import { getFormPaths } from "@devographics/templates";
import { DbPathsEnum, Option } from "@devographics/types";
import { useFormStateContext } from "../form/FormStateContext";
import { FormattedMessage } from "../common/FormattedMessage";

const columns = [0, 1, 2, 3, 4];

export const FormComponentLikertScale = (props: FormInputProps) => {
  const { value, edition, question } = props;
  const { options } = question;

  const formPaths = getFormPaths({ edition, question });

  return (
    <FormItem {...props} className="likert">
      <div className="likert-legends-wrapper">
        <div className="likert-legends">
          {columns?.map((column, i) => (
            <span key={i} className="likert-legend-label">
              <FormattedMessage id={`likert.option.${i}`} />
            </span>
          ))}
        </div>
      </div>
      {options?.map((option, i) => {
        const formPath = formPaths?.[DbPathsEnum.SUBPATHS]?.[option.id];
        return formPath ? (
          <Row
            key={i}
            rowIndex={i}
            option={option}
            formPath={formPath}
            {...props}
          />
        ) : (
          <span>
            <code>Error: no formPath found for {option.id}</code>
          </span>
        );
      })}
    </FormItem>
  );
};

type RowProps = FormInputProps & {
  formPath: string;
  rowIndex: number;
  option: Option;
};

const Row = (props: RowProps) => {
  return (
    <div className="likert-row">
      <div className="likert-label">
        <FormOption {...props} option={props.option} />
      </div>
      <div className="likert-options">
        {columns.map((column, i) => (
          <Radio key={i} radioIndex={i} {...props} />
        ))}
      </div>
    </div>
  );
};

const Radio = (props: RowProps & { radioIndex: number }) => {
  const { radioIndex, path, updateCurrentValues, readOnly, formPath } = props;
  const { response } = useFormStateContext();

  const value = response?.[formPath];
  const hasValue = value !== "";

  const isChecked = value === radioIndex;
  const checkClass = hasValue
    ? isChecked
      ? "form-check-checked"
      : "form-check-unchecked"
    : "";

  const disabled = readOnly;

  return (
    <Form.Check type="radio" className="likert-option">
      <Form.Check.Label htmlFor={`${formPath}.${radioIndex}`}>
        <div className="form-input-wrapper">
          <Form.Check.Input
            type="radio"
            value={radioIndex}
            name={formPath}
            id={`${formPath}.${radioIndex}`}
            checked={isChecked}
            className={checkClass}
            onClick={(e) => {
              if (value === radioIndex) {
                updateCurrentValues({ [formPath]: null });
              }
            }}
            onChange={(e) => {
              updateCurrentValues({ [formPath]: radioIndex });
            }}
            disabled={disabled}
          />
        </div>
        <span className="sr-only">
          <FormattedMessage id={`likert.option.${radioIndex}`} />
        </span>
      </Form.Check.Label>
    </Form.Check>
  );
};
export default FormComponentLikertScale;
