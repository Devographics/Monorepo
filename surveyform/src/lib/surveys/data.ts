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
    2024: { surveyId: "state_of_css", editionId: "css2024" },
    2025: { surveyId: "state_of_css", editionId: "css2025" },
    2026: { surveyId: "state_of_css", editionId: "css2026" },
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
    2024: { surveyId: "state_of_js", editionId: "js2024" },
    2025: { surveyId: "state_of_js", editionId: "js2025" },
    2026: { surveyId: "state_of_js", editionId: "js2026" },
  },
  "state-of-react": {
    2023: { surveyId: "state_of_react", editionId: "react2023" },
    2024: { surveyId: "state_of_react", editionId: "react2024" },
    2025: { surveyId: "state_of_react", editionId: "react2025" },
    2026: { surveyId: "state_of_react", editionId: "react2026" },
  },
  "state-of-html": {
    2023: { surveyId: "state_of_html", editionId: "html2023" },
    2024: { surveyId: "state_of_html", editionId: "html2024" },
    2025: { surveyId: "state_of_html", editionId: "html2025" },
    2026: { surveyId: "state_of_html", editionId: "html2026" },
  },
  tokyodev: {
    2020: { surveyId: "tokyodev", editionId: "td2020" },
    2021: { surveyId: "tokyodev", editionId: "td2021" },
    2022: { surveyId: "tokyodev", editionId: "td2022" },
    2023: { surveyId: "tokyodev", editionId: "td2023" },
    2024: { surveyId: "tokyodev", editionId: "td2024" },
    2025: { surveyId: "tokyodev", editionId: "td2025" },
    2026: { surveyId: "tokyodev", editionId: "td2026" },
  },
  "state-of-ai": {
    2025: { surveyId: "state_of_ai", editionId: "ai2025" },
    2026: { surveyId: "state_of_ai", editionId: "ai2026" },
  },
  "state-of-devs": {
    2025: { surveyId: "state_of_devs", editionId: "devs2025" },
    2026: { surveyId: "state_of_devs", editionId: "devs2026" },
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
