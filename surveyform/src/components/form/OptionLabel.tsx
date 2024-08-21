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

  const i18n = getOptioni18nIds({ option, question });

  let fallback;
  if (label) {
    fallback = label;
  } else if (option.id === OPTION_NA) {
    fallback = t("options.na");
  }

  const entityName = getEntityName(entity);

  return entityName ? (
    <EntityLabel entity={entity} />
  ) : (
    <T token={i18n.base} fallback={fallback} />
  );
};

export default OptionLabel;
