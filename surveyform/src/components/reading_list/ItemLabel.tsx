import { EntityWithQuestion } from "~/lib/surveys/types";
import QuestionLabel from "../form/QuestionLabel";
import EntityLabel from "~/components/common/EntityLabel";
import { getQuestioni18nIds } from "~/i18n/survey";
import { useIntlContext } from "@devographics/react-i18n-legacy";
import OptionLabel from "../form/OptionLabel";

const ItemLabel = ({ entity }: { entity: EntityWithQuestion }) => {
  const intl = useIntlContext();

  const { question, id } = entity;
  if (!question) {
    return null;
  }

  const option = question?.options?.find((o) => o.id === id);

  if (id === question.id) {
    // 1. entity is a question entity
    return <QuestionItem question={question} />;
  } else if (option) {
    // 2. entity is an option entity
    return <OptionItem question={question} option={option} />;
  } else {
    // 3. else, default to entity's own name
    return <EntityLabel entity={entity} />;
  }
};

const QuestionItem = ({ question }) => {
  return (
    <QuestionLabel
      formatCode={false}
      section={question.section}
      question={question}
    />
  );
};

const OptionItem = ({ option, question }) => {
  return <OptionLabel option={option} question={question} />;
};
export default ItemLabel;
