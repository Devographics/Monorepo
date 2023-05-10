import Form from "react-bootstrap/Form";
import EntityLabel, {
  EntityLabelProps,
} from "~/core/components/common/EntityLabel";
import { useIntlContext } from "@devographics/react-i18n";
import { Entity } from "@devographics/core-models";

export interface FormLabelProps {
  questionId: string;
  label: string;
  layout?: "horizontal" | "vertical";
  path: string;
  year?: number;
  inputProperties: any;
  // TODO
  questionObject?: any;
}
export const FormLabel = ({
  questionId,
  label,
  layout,
  path,
  year,
  questionObject,
  inputProperties,
}: FormLabelProps) => {
  const intl = useIntlContext();
  const labelProps = layout === "horizontal" ? { column: true, sm: 3 } : {};
  const entityProps: Partial<EntityLabelProps> = {
    id: questionId,
    fallback: label,
  };

  // if label has been translated, use that to override entity name
  if (label.toLowerCase() !== path) {
    entityProps.label = label;
  }

  return (
    <h3 className="form-label-heading">
      <Form.Label {...labelProps}>
        <EntityLabel {...entityProps} entity={questionObject.entity} />
        {year === 2022 && (
          <span
            className="question-label-new"
            title={intl.formatMessage({ id: "general.newly_added" })}
          >
            {year}
          </span>
        )}
      </Form.Label>
    </h3>
  );
};

export default FormLabel;
