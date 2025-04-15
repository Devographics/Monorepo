import { T } from "@devographics/react-i18n";
import { FormItemProps } from "./Item";
import { InfoIcon, MultipleIcon } from "@devographics/icons";
import { useI18n } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "~/lib/i18n/survey";

type Indication = {
  icon: React.ReactNode;
  contents: React.ReactNode;
};

export const FormItemIndications = ({ question, section }: FormItemProps) => {
  const { limit } = question;
  const checkAll =
    question.allowMultiple &&
    ["multiple", "multipleWithOther"].includes(question.template);

  let indications: Indication[] = [];

  const { t, getMessage } = useI18n();
  const intlIds = getQuestioni18nIds({ question, section });
  const i18nPrompt = getMessage(intlIds.prompt);

  if (i18nPrompt && !i18nPrompt.missing) {
    indications = [
      {
        icon: <InfoIcon />,
        contents: <T token={intlIds.prompt} />,
      },
    ];
  }

  if (limit) {
    // if a limit is defined, override the "check all" indication
    indications.push({
      icon: <div className="form-item-indications-limit">{limit}</div>,
      contents: <T values={{ limit }} token="general.pick_up_to" />,
    });
  } else if (checkAll) {
    indications.push({
      icon: <MultipleIcon />,
      contents: <T token="general.check_all" />,
    });
  }

  return indications.length > 0 ? (
    <div className="form-item-indications">
      {indications.map((indication, i) => (
        <FormItemIndicationWrapper key={i} {...indication} />
      ))}
    </div>
  ) : null;
};

export const FormItemIndicationWrapper = ({ icon, contents }: Indication) => {
  return (
    <div className="form-item-indication">
      <div className="form-item-indication-icon">{icon}</div>
      <div className="form-item-indication-description"> {contents}</div>
    </div>
  );
};
