import { encodeParams } from "./utils";

export interface ApiData<T = any> {
  data: T;
  error: any;
}

/**
 * NOTE: this is SHARED code not API only, we use this in the frontend as well
 */
export const apiRoutes = {
  account: {
    logout: {
      href: () => "/api/account/logout",
      method: "POST",
    },
    currentUser: {
      href: () => "/api/account/current-user",
      method: "GET",
    },
    magicLogin: {
      verifyToken: {
        href: (params: { token: string }) =>
          `/api/account/magic-login/verifyToken?${encodeParams(params)}`,
      },
      verifyTokenAndFindCreateResponse: {
        href: (params: { token: string }) =>
          `/api/account/magic-login/verifyTokenAndFindCreateResponse?${encodeParams(
            params
          )}`,
      },
      sendEmail: {
        href: () => `/api/account/magic-login/sendEmail`,
      },
    },
    anonymousLogin: {
      login: {
        href: () => "/api/account/anonymous-login/login",
      },
      loginAndCreateResponse: {
        href: () => "/api/account/anonymous-login/loginAndCreateResponse",
      },
    },
  },
  responses: {
    loadResponse: {
      href: ({ responseId }: { responseId: string }) =>
        `/api/responses/${responseId}/loadResponse`,
    },
    createResponse: {
      href: () => `/api/responses/createResponse`,
    },
    saveResponse: {
      href: ({ responseId }: { responseId: string }) =>
        `/api/responses/${responseId}/saveResponse`,
    },
    sendReadingList: {
      href: ({ responseId }: { responseId: string }) =>
        `/api/responses/${responseId}/sendReadingList`,
    },
  },
  projects: {
    search: {
      href: ({ query }: { query: string }) =>
        `/api/projects/search?query=${query}`,
    },
  },
  stats: {
    rank: {
      href: ({ score, editionId }) => `/api/stats/?score=${score}&editionId=${editionId}`
    }
  }
};
