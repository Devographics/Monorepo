import EntityLabel from "~/core/components/common/EntityLabel";
import { FormInputProps } from "~/surveys/components/form/typings";
import { OptionMetadata } from "@devographics/types";
import { useIntlContext } from "@devographics/react-i18n";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { getOptioni18nIds } from "@devographics/i18n";

interface FormOptionProps extends FormInputProps {
  option: OptionMetadata;
}

export const FormOption = (props: FormOptionProps) => {
  const { option } = props;
  const { entity } = option;

  const intl = useIntlContext();
  const i18n = getOptioni18nIds(props);

  const optionDescription = intl.formatMessage({
    id: i18n.description,
  });

  return (
    <div className="form-option">
      <span className="form-option-label">
        {entity ? (
          <EntityLabel entity={entity} />
        ) : (
          <FormattedMessage id={i18n.base} />
        )}
      </span>

      {optionDescription && (
        <FormattedMessage
          className="form-option-description"
          id={i18n.description}
        />
      )}
    </div>
  );
};

export default FormOption;
