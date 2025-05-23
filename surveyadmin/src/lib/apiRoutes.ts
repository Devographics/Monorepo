export function encodeParams(params) {
  const searchParams = new URLSearchParams(params);
  return searchParams.toString();
}

export const apiRoutes = {
  scripts: {
    loadScripts: {
      href: () => `/api/scripts/loadScripts`,
    },
    runScript: {
      href: () => `/api/scripts/runScript`,
    },
  },
  normalization: {
    loadUnnormalizedData: {
      href: (params) =>
        `/api/normalization/loadUnnormalizedData?${encodeParams(params)}`,
    },
    loadQuestionResponses: {
      href: (params) =>
        `/api/normalization/loadQuestionResponses?${encodeParams(params)}`,
    },
    loadQuestionData: {
      href: (params) =>
        `/api/normalization/loadQuestionData?${encodeParams(params)}`,
    },
    loadCustomNormalizations: {
      href: (params) =>
        `/api/normalization/loadCustomNormalizations?${encodeParams(params)}`,
    },
    loadWordFrequencies: {
      href: (params) =>
        `/api/normalization/loadWordFrequencies?${encodeParams(params)}`,
    },
    normalizeQuestion: {
      href: (params) => `/api/normalization/normalizeQuestion`,
    },
    normalizeResponses: {
      href: (params) => `/api/normalization/normalizeResponses`,
    },
    normalizeQuestionResponses: {
      href: (params) => `/api/normalization/normalizeQuestionResponses`,
    },
    normalizeEdition: {
      href: (params) => `/api/normalization/normalizeEdition`,
    },
    addCustomTokens: {
      href: (params) => `/api/normalization/addCustomTokens`,
    },
    renameTokens: {
      href: (params) => `/api/normalization/renameTokens`,
    },
    deleteTokens: {
      href: (params) => `/api/normalization/deleteTokens`,
    },
    approveTokens: {
      href: (params) => `/api/normalization/approveTokens`,
    },
    removeCustomTokens: {
      href: (params) => `/api/normalization/removeCustomTokens`,
    },
    enableRegularTokens: {
      href: (params) => `/api/normalization/enableRegularTokens`,
    },
    disableRegularTokens: {
      href: (params) => `/api/normalization/disableRegularTokens`,
    },
    importNormalizationsCSV: {
      href: (params) => `/api/normalization/importNormalizationsCSV`,
    },
    importNormalizationsJSON: {
      href: (params) => `/api/normalization/importNormalizationsJSON`,
    },
  },
  export: {
    generate: {
      href: ({
        editionId,
        surveyId,
      }: {
        editionId: string;
        surveyId: string;
      }) => `/api/export/generate?surveyId=${surveyId}&editionId=${editionId}`,
    },
    download: {
      href: ({
        editionId,
        surveyId,
        timestamp,
      }: {
        editionId: string;
        surveyId: string;
        timestamp: string;
      }) =>
        `/api/export/download?surveyId=${surveyId}&editionId=${editionId}&timestamp=${timestamp}`,
    },
  },
};
