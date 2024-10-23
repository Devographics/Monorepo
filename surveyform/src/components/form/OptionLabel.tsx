import { getEntityNameHtml } from "~/lib/surveys/helpers/getEntityName";
import EntityLabel from "~/components/common/EntityLabel";
import { T, useI18n } from "@devographics/react-i18n";
import {
  OPTION_NA,
  OptionMetadata,
  QuestionMetadata,
} from "@devographics/types";
import { getOptioni18nIds } from "~/lib/i18n/survey";

const OptionLabel = ({
  option,
  question,
}: {
  option: OptionMetadata;
  question: QuestionMetadata;
}) => {
  const { t, getString } = useI18n();
  const { entity, label } = option;

  const i18n = getOptioni18nIds({ option, question });

  let fallback;
  if (label) {
    fallback = label;
  } else if (option.id === OPTION_NA) {
    fallback = t("options.na");
  } else {
    fallback = option.id;
  }

  const hasEntityName = !!getEntityNameHtml(entity);

  const i18nObject = getString(i18n.base);
  const i18nLabel = i18nObject.missing ? undefined : i18nObject?.t;

  return hasEntityName ? (
    <EntityLabel entity={entity} i18nLabel={i18nLabel} />
  ) : (
    <T token={i18n.base} fallback={fallback} />
  );
};

export default OptionLabel;
