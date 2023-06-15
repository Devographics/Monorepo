import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getQuestioni18nIds } from "@devographics/i18n";
import { QuestionMetadata, SectionMetadata } from "@devographics/types";

export const QuestionLabel = ({
  section,
  question,
  formatCode = true,
}: {
  section: SectionMetadata;
  question: QuestionMetadata;
  formatCode?: boolean;
}) => {
  const { entity } = question;
  const i18n = getQuestioni18nIds({ section, question });

  const entityName =
    entity && (entity.nameHtml || entity.nameClean || entity.name);

  return entityName ? (
    formatCode ? (
      <span
        className="entity-label"
        dangerouslySetInnerHTML={{
          __html: entityName,
        }}
      />
    ) : (
      <span className="entity-label">{entity.nameClean}</span>
    )
  ) : (
    <FormattedMessage id={i18n.base} />
  );
};

export default QuestionLabel;
