import { FormInputProps } from "~/components/form/typings";
import { OptionMetadata } from "@devographics/types";
import { useIntlContext } from "@devographics/react-i18n";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getOptioni18nIds } from "@devographics/i18n";
import { useOptionTitle } from "~/lib/surveys/helpers/useOptionTitle";
import AddToList from "~/components/reading_list/AddToList";
import OptionLabel from "./OptionLabel";

interface FormOptionProps extends FormInputProps {
  option: OptionMetadata;
}
export const FormOption = (props: FormOptionProps) => {
  const { option, question } = props;
  const { entity } = option;

  const intl = useIntlContext();
  const i18n = getOptioni18nIds(props);

  const optionDescription = intl.formatMessage({
    id: i18n.description,
  });

  const { clean: label } = useOptionTitle({ question, option });

  return (
    <div className="form-option">
      <div className="form-option-item">
        <span className="form-option-label">
          <OptionLabel question={question} option={option} />
        </span>
        {optionDescription && (
          <FormattedMessage
            className="form-option-description"
            id={i18n.description}
          />
        )}
      </div>
      {entity && (
        <div className="form-option-add">
          <AddToList {...props} label={label} id={option.id} />
        </div>
      )}
    </div>
  );
};

export default FormOption;
