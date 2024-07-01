import { getEntityName } from "~/lib/surveys/helpers/getEntityName";
import EntityLabel from "~/components/common/EntityLabel";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import {
  OPTION_NA,
  OptionMetadata,
  QuestionMetadata,
} from "@devographics/types";
import { getOptioni18nIds } from "~/i18n/survey";
import { useIntlContext } from "@devographics/react-i18n-legacy";
import { teapot } from "@devographics/react-i18n";
// import { tokens } from "./TODO.tokens";

const { T } = teapot(["TOKEN"]);

const OptionLabel = ({
  option,
  question,
}: {
  option: OptionMetadata;
  question: QuestionMetadata;
}) => {
  const intl = useIntlContext();
  const { entity, label } = option;

  if (label) {
    return <>{label}</>;
  }

  const i18n = getOptioni18nIds({ option, question });

  const defaultMessage =
    option.id === OPTION_NA
      ? intl.formatMessage({ id: "options.na" })?.t
      : i18n.base + " ❔";

  const entityName = getEntityName(entity);

  return entityName ? (
    <EntityLabel entity={entity} />
  ) : (
    <T token={i18n.base} fallback={defaultMessage} />
  );
};

export default OptionLabel;
