export type SurveyParam = {
  surveyId: string;
  editionId: string;
};
export type ReverseSurveyParam = {
  surveySlug: string;
  editionSlug: string;
};
export type SurveyParamsTable = {
  [slug: string]: {
    [year: number]: SurveyParam;
  };
};

/**
 * Map to get survey id and edition id from the slug and year
 *
 * TODO: move me in a special file of the "surveys" repo to avoid hard-coding
 * This means it should be loaded asynchronously
 *
 * TODO: this probably belongs to the shared repo too
 */
export const getSurveyParamsTable = (): SurveyParamsTable => ({
  "demo-survey": {
    2022: { surveyId: "demo_survey", editionId: "demo2022" },
  },
  "state-of-css": {
    2019: { surveyId: "state_of_css", editionId: "css2019" },
    2020: { surveyId: "state_of_css", editionId: "css2020" },
    2021: { surveyId: "state_of_css", editionId: "css2021" },
    2022: { surveyId: "state_of_css", editionId: "css2022" },
    2023: { surveyId: "state_of_css", editionId: "css2023" },
  },
  "state-of-graphql": {
    2022: { surveyId: "state_of_graphql", editionId: "graphql2022" },
  },
  "state-of-js": {
    2016: { surveyId: "state_of_js", editionId: "js2016" },
    2017: { surveyId: "state_of_js", editionId: "js2017" },
    2018: { surveyId: "state_of_js", editionId: "js2018" },
    2019: { surveyId: "state_of_js", editionId: "js2019" },
    2020: { surveyId: "state_of_js", editionId: "js2020" },
    2021: { surveyId: "state_of_js", editionId: "js2021" },
    2022: { surveyId: "state_of_js", editionId: "js2022" },
    2023: { surveyId: "state_of_js", editionId: "js2023" },
  },
  "state-of-react": {
    2023: { surveyId: "state_of_react", editionId: "react2023" },
  },
});

export const surveyParamsLookup = ({
  surveySlug,
  editionSlug,
}): SurveyParam => {
  return getSurveyParamsTable()[surveySlug][editionSlug];
};

export const reverseSurveyParamsLookup = ({
  surveyId,
  editionId,
}): ReverseSurveyParam => {
  const table = getSurveyParamsTable();
  for (const surveySlug of Object.keys(table)) {
    const editions = table[surveySlug];
    for (const editionSlug of Object.keys(editions)) {
      const edition = editions[editionSlug];
      if (edition.surveyId === surveyId && edition.editionId === editionId) {
        return { surveySlug, editionSlug };
      }
    }
  }
  throw Error(
    `Could not find surveyId and editionId for ${surveyId}/${editionId} in SurveyParamsTable`
  );
};
