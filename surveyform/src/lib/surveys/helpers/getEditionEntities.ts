import { EditionMetadata } from "@devographics/types";
import { EntityWithQuestion } from "~/lib/surveys/types";
import { getEditionQuestions } from "./getEditionQuestions";

export const getEditionEntities = (
  edition: EditionMetadata
): Array<EntityWithQuestion> => {
  const allQuestions = getEditionQuestions(edition);

  // decorate each question's entity with the question
  // so we can figure out the entity's label later on
  const questionEntities = allQuestions
    .filter((q) => q.entity)
    .map((question) => ({
      ...question.entity,
      question,
    })) as Array<EntityWithQuestion>;

  const optionEntities = allQuestions
    .map((question) =>
      question.options?.map((o) => {
        // decorate each option's entity with question the option belongs to
        // so we can figure out the entity's label later on
        if (o.entity) {
          return { ...o, entity: { ...o.entity, question } };
        } else {
          return o;
        }
      })
    )
    .flat()
    .filter((o) => o?.entity)
    .map((o) => o?.entity) as Array<EntityWithQuestion>;
  const allEntities = [...questionEntities, ...optionEntities];
  return allEntities;
};
