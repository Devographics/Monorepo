import { FormInputProps } from "~/components/form/typings";
import { OptionMetadata } from "@devographics/types";
import { useIntlContext } from "@devographics/react-i18n";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getOptioni18nIds } from "@devographics/i18n";
import { useOptionTitle } from "~/lib/surveys/helpers/useOptionTitle";
import AddToList from "~/components/reading_list/AddToList";
import OptionLabel from "./OptionLabel";
import { FollowUps } from "../inputs/experience/Followup2";

interface FormOptionProps extends FormInputProps {
  option: OptionMetadata;
  isNA?: boolean;
  followupData?: any;
}
export const FormOption = (props: FormOptionProps) => {
  const { option, question, followupData, isNA } = props;
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
          {!isNA && followupData && (
            <FollowUps {...props} followupData={followupData} />
          )}
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
