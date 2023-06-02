import { string } from "zod";

export const outlineSegment = "outline"
/**
 * Route manifest
 * TODO: should be automatically generated based on the pages/app folder
 */
// NOTE: those function can also be used server-side, for instance in mails
export const routes = {
  home: {
    href: "/",
  },
  account: {
    root: {
      href: "/account",
    },
    login: {
      href: "/account/login",
      from: (currentUrl: string) => `/account/login?from=${encodeURIComponent(currentUrl)}`
    },
    profile: {
      href: "/account/profile",
    },
    magicLogin: {
      href: "/account/magic-login",
    },
  },
  admin: {
    home: {
      href: "/admin",
    },
    login: {
      href: "/admin/login",
    },
    export: {
      href: "/admin/export",
    },
  },
  // state of js
  survey: {
    root: { href: "/survey" },
    home: { href: ({ slug, year }: { slug: string, year: string }) => `/survey/${slug}/${year}` }
  },
};
