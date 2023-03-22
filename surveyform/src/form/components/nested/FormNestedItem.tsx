import { useIntlContext } from "@devographics/react-i18n";
import { Button } from "~/core/components/ui/Button";
import FormComponent from "../elements/FormComponent";
import { IconRemove } from "./FormNestedArray";
import { FormComponentProps } from "~/form/typings";

export const FormNestedItemLayout = ({ content, removeButton }) => (
  <div className="form-nested-item">
    <div className="form-nested-item-inner">{content}</div>
    {removeButton && [
      <div key="remove-button" className="form-nested-item-remove">
        {removeButton}
      </div>,
      <div
        key="remove-button-overlay"
        className="form-nested-item-deleted-overlay"
      />,
    ]}
  </div>
);

export interface FormNestedItemProps extends FormComponentProps {
  nestedFields: Array<{ name: string } & any>;
  name: string;
  path: string;
  removeItem: (name: string) => void;
  itemIndex: any;
  hideRemove?: boolean;
  label: string;
}
export const FormNestedItem = ({
  nestedFields,
  name,
  path,
  removeItem,
  itemIndex,
  hideRemove,
  label,
  ...props
}: FormNestedItemProps) => {
  const intl = useIntlContext();
  const isArray = typeof itemIndex !== "undefined";
  return (
    <FormNestedItemLayout
      content={nestedFields.map((field, i) => {
        return (
          <FormComponent
            key={i}
            {...props}
            {...field}
            path={`${path}.${field.name}`}
            itemIndex={itemIndex}
          />
        );
      })}
      removeButton={
        isArray &&
        !hideRemove && [
          <div key="remove-button" className="form-nested-item-remove">
            <Button
              className="form-nested-button"
              variant="danger"
              size="sm"
              iconButton
              tabIndex={-1}
              onClick={() => {
                removeItem(name);
              }}
              aria-label={intl.formatMessage(
                { id: "forms.delete_nested_field" },
                { label: label }
              )}
            >
              <IconRemove height={12} width={12} />
            </Button>
          </div>,
          <div
            key="remove-button-overlay"
            className="form-nested-item-deleted-overlay"
          />,
        ]
      }
    />
  );
};
