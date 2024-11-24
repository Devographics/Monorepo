import { FormInputProps } from "~/components/form/typings";
import { OptionMetadata } from "@devographics/types";
import { T, useI18n } from "@devographics/react-i18n";
import { getOptioni18nIds } from "~/lib/i18n/survey";
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
  const entityDescriptioni18nKey = `entities.${option.id}.description`;
  const entityI18nDescription = getMessage(entityDescriptioni18nKey);
  const entity = option?.entity;
  const entityDescription = entity?.descriptionHtml || entity?.descriptionClean;

  if (!i18nDescription.missing) {
    // 1. option has a translated description
    return <T className="form-option-description" token={i18n.description} />;
  } else if (!entityI18nDescription.missing) {
    // 2. entity has a translated description
    return (
      <T className="form-option-description" token={entityDescriptioni18nKey} />
    );
  } else if (entityDescription) {
    // 3. entity has a hardcoded description
    if (entity?.tags?.includes("libraries")) {
      // we don't need to show description for libraries since it's just
      // a matter of whether you recognize the name or not
      return null;
    }
    return (
      <span
        className="form-option-description"
        dangerouslySetInnerHTML={{
          __html: entityDescription,
        }}
      />
    );
  } else {
    return null;
  }
};

export default FormOption;
