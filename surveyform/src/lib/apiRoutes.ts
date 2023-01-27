import { SurveyDocument } from "@devographics/core-models";

/**
 * NOTE: this is SHARED code not API only, we use this in the frontend as well
 */
export const apiRoutes = {
  /** @deprecated try to move graphql calls to backend only */
  graphql: {
    href: "/api/graphql",
    method: "POST"
  },
  account: {
    // POST
    signup: {
      href: "/api/account/signup",
      method: "POST",
    },
    login: {
      href: "/api/account/login",
      method: "POST",
    },
    logout: {
      href: "/api/account/logout",
      method: "POST",
    },
    sendResetPasswordEmail: {
      href: "/api/account/send-reset-password-email",
      method: "POST",
    },
    changePassword: {
      href: "/api/account/changePassword",
      method: "POST",
    },
    verifyEmail: {
      href: "/api/account/verify-email",
      method: "POST",
    },
    // GET
    user: {
      href: "/api/account/user",
      method: "GET",
    },
    magicLogin: {
      verifyToken: {
        href: "/api/account/magic-login/verify-token",
        method: "GET",
      },
      sendEmail: {
        href: "/api/account/magic-login/send-email",
        method: "POST",
      },
    },
    anonymousLogin: {
      login: {
        href: "/api/account/anonymous-login/login",
      },
    },
  },
  admin: {
    dataExport: { href: "/api/admin/data-export" },
  },
  response: {
    single: {
      href: ({ surveySlug }: { surveySlug: string }) => `/api/response/single?surveySlug=${surveySlug}`
    },
    multi: {
      href: "/api/response/multi"
    },
    startSurvey: {
      href: ({ slug, year }: Required<Pick<SurveyDocument, "slug" | "year">>) => `/api/response/start-survey?surveySlug=${slug}&surveyYear=${year}`
    },
    saveSurvey: {
      href: ({ slug, year }: Required<Pick<SurveyDocument, "slug" | "year">>) => `/api/response/save-survey?surveySlug=${slug}&surveyYear=${year}`
    }
  }
}
