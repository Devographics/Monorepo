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
    loadFields: {
      href: (params) => `/api/normalization/loadFields?${encodeParams(params)}`,
    },
    normalizeResponses: {
      href: () => `/api/normalization/normalizeResponses`,
    },
  },
};
