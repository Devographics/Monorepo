import { FormInputProps } from "~/components/form/typings";
import { OptionMetadata } from "@devographics/types";
import { T, useI18n } from "@devographics/react-i18n";
import { getOptioni18nIds } from "~/i18n/survey";
import { useOptionTitle } from "~/lib/surveys/helpers/useOptionTitle";
import AddToList from "~/components/reading_list/AddToList";
import OptionLabel from "./OptionLabel";
import { FollowUps } from "../inputs/experience/Followup2";

//

interface FormOptionProps extends FormInputProps {
  option: OptionMetadata;
  isNA?: boolean;
  followupData?: any;
  isChecked?: boolean;
}
export const FormOption = (props: FormOptionProps) => {
  const {
    option,
    question,
    followupData,
    isNA,
    isChecked = false,
    enableReadingList,
  } = props;
  const { entity } = option;

  const { t } = useI18n();
  const i18n = getOptioni18nIds(props);

  const optionDescription = t(i18n.description);

  const { clean: label } = useOptionTitle({ question, option });

  return (
    <div className="form-option">
      <div className="form-option-item">
        <span className="form-option-label">
          <OptionLabel question={question} option={option} />
          {!isNA && followupData && (
            <FollowUps
              {...props}
              optionIsChecked={isChecked}
              followupData={followupData}
            />
          )}
        </span>
        <OptionDescription {...props} />
      </div>
      {enableReadingList && entity && (
        <div className="form-option-add">
          <AddToList {...props} label={label} id={option.id} />
        </div>
      )}
    </div>
  );
};

const OptionDescription = (props: FormOptionProps) => {
  const { option } = props;
  const { t, getMessage } = useI18n();
  const i18n = getOptioni18nIds(props);

  const i18nDescription = getMessage(i18n.description);

  const entity = option?.entity;
  const entityDescription = entity?.descriptionHtml || entity?.descriptionClean;

  return !i18nDescription.missing ? (
    <T className="form-option-description" token={i18n.description} />
  ) : entityDescription ? (
    <span
      className="form-option-description"
      dangerouslySetInnerHTML={{
        __html: entityDescription,
      }}
    />
  ) : null;
};

export default FormOption;
