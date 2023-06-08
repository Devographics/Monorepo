import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getQuestioni18nIds } from "@devographics/i18n";
import { QuestionMetadata, SectionMetadata } from "@devographics/types";

export const QuestionLabel = ({
  section,
  question,
}: {
  section: SectionMetadata;
  question: QuestionMetadata;
}) => {
  const { entity } = question;
  const i18n = getQuestioni18nIds({ section, question });

  const entityName =
    entity && (entity.nameHtml || entity.nameClean || entity.name);

  return entityName ? (
    <span
      className="entity-label"
      dangerouslySetInnerHTML={{
        __html: entityName,
      }}
    />
  ) : (
    <FormattedMessage id={i18n.base} />
  );
};

export default QuestionLabel;
