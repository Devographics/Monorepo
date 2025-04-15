import { T } from "@devographics/react-i18n";
import { FormItemProps } from "./Item";

export const FormItemCheckAll = (props: FormItemProps) => {
  const checkAll =
    props.question.allowMultiple &&
    ["multiple", "multipleWithOther"].includes(props.question.template);
  return checkAll ? (
    <div className="form-item-checkAll">
      <T token="general.check_all" />
    </div>
  ) : null;
};
