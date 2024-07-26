import { getEntityName } from "~/lib/surveys/helpers/getEntityName";
import EntityLabel from "~/components/common/EntityLabel";
import { T, useI18n } from "@devographics/react-i18n";
import {
  OPTION_NA,
  OptionMetadata,
  QuestionMetadata,
} from "@devographics/types";
import { getOptioni18nIds } from "~/i18n/survey";

const OptionLabel = ({
  option,
  question,
}: {
  option: OptionMetadata;
  question: QuestionMetadata;
}) => {
  const { t } = useI18n();
  const { entity, label } = option;

  if (label) {
    return <>{label}</>;
  }

  const i18n = getOptioni18nIds({ option, question });

  const defaultMessage =
    option.id === OPTION_NA
      ? t("options.na")
      : i18n.base + " ❔";

  const entityName = getEntityName(entity);

  return entityName ? (
    <EntityLabel entity={entity} />
  ) : (
    <T token={i18n.base} fallback={defaultMessage} />
  );
};

export default OptionLabel;
