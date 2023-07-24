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
  },
  dataExport: {
    // TODO: recreate this API route
    href: ({ editionId, surveyId }: { editionId: string, surveyId: string }) => `/api/data-export?surveyId=${surveyId}&editionId=${editionId}`
  }
};
