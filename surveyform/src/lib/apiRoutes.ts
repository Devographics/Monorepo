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
        href: () => "/api/account/magic-login/verify-token",
        method: "GET",
      },
      sendEmail: {
        href: () => "/api/account/magic-login/send-email",
        method: "POST",
      },
    },
    anonymousLogin: {
      login: {
        href: () => "/api/account/anonymous-login/login",
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
        `/api/responses/${responseId}/saveResponse/`,
    },
  },
  projects: {
    search: {
      href: ({ query }: { query: string }) =>
        `/api/projects/search?query=${query}`,
    },
  },
};
