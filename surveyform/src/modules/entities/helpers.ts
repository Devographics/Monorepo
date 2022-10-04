import type { ParsedQuestion, SurveyQuestion, SurveyDocument } from "@devographics/core-models";

export const getEntityIdsFromQuestions = (questions: ParsedQuestion[]) => {
  let ids: string[] = [];
  questions.forEach((question) => {
    const { id, options } = question;
    if (id) {
      ids.push(id);
      if (options) {
        let optionsArray;
        if (typeof options === "function") {
          // TODO: options is a function of the props, that should contain a "data" field
          // Probably coming from an autocomplete
          // We can't handle that yet
          optionsArray = []; //options();
        } else {
          optionsArray = options;
        }
        optionsArray.forEach(({ id }) => {
          if (id) {
            ids.push(id);
          }
        });
      }
    }
  });
  return ids;
};

export const getEntityIdsFromSurvey = (survey: SurveyDocument) => {
  let ids: string[] = [];
  for (const section of survey.outline) {
    // TODO: fix types and get rid of casting here
    const questions = section.questions as ParsedQuestion[]
    ids = [...ids, ...getEntityIdsFromQuestions(questions)];
  }
  return ids;
};
