// Set to english (NOTE: this won't work in before.ts)
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";

beforeEach(() => {
  // NOTE: those operations are expensive! When testing less-critical part of your UI,
  // prefer mocking API calls! We do this only because auth is very critical
  cy.exec("pnpm run db:test:reset");
  cy.exec("pnpm run db:test:seed");
  //cy.task("resetEmails");

  // Set the page to english
  // NOTE: this would be better in  "cypress/support/before.ts" but importing i18n lib won't work
  // @see https://github.com/scottohara/loot/issues/185
  cy.setCookie(LOCALE_COOKIE_NAME, "en-US");
  // logout
  cy.clearCookie("token");
});
after(() => {
  // clean the db when done
  cy.exec("pnpm run db:test:reset");
  cy.exec("pnpm run db:test:seed");
});

const test = it;

// NOTE: we can't change Accept-Language header easily in a Cypress test so we test only the manually set cookie
test("Use language from cookies", () => {
  const frLocale = "fr-FR";
  cy.setCookie(LOCALE_COOKIE_NAME, frLocale);
  cy.visit("/");
  cy.findByText(/Questionnaires en cours/, { timeout: 0 }).should("exist");
  // Should not switch to en when js is loaded
  cy.findByText(/Questionnaires en cours/).should("exist");
  cy.findByText(/Open Surveys/).should("not.exist");
  cy.getCookie(LOCALE_COOKIE_NAME).its("value").should("equal", "fr-FR");
});
/*
FIXME: can't be tested this way, if the cookie matches a non-listed locale,
Next.js will fallback to Accept-Language (so en as a default) but we can't customize that in Cypress
test("When using unlisted locale, fallback to closest country locale", () => {
  const unlistedFrLocale = "fr-CA";
  cy.setCookie(LOCALE_COOKIE_NAME, unlistedFrLocale);
  cy.visit("/");
  cy.findByText(/Questionnaires en cours/, { timeout: 0 }).should("exist");
  // Should not switch to en when js is loaded
  cy.findByText(/Questionnaires en cours/).should("exist");
  cy.findByText(/Surveys/).should("not.exist");
  //cy.getCookie(LOCALE_COOKIE_NAME).its("value").should("equal", "fr-FR");
});
*/
test("When using unlisted locale, fallback to closest country locale", () => {
  cy.clearCookie(LOCALE_COOKIE_NAME);
  // NOTE: we only test the SSR request because a normal cy.visit won't let us customize request header to force fr-CA
  const unlistedFrLocale = "fr-CA";
  cy.request({
    url: Cypress.config().baseUrl + "/",
    headers: { "Accept-Language": `${unlistedFrLocale};q=0.9` },
    followRedirect: true,
  }).as("homeFr");
  cy.get("@homeFr").its("body").should("include", 'lang="fr"');
});
test("Switch locale via UI", () => {
  cy.visit("/");
  cy.findByRole("button", { name: /English/i })
    .as("localeSwitcher")
    .click();
  cy.findByRole("button", { name: /français/i }).click();
  // Should not switch to en when js is loaded
  cy.findByText(/Questionnaires en cours/).should("exist");
  cy.findByText(/Open Surveys/).should("not.exist");
  cy.getCookie(LOCALE_COOKIE_NAME).its("value").should("equal", "fr-FR");
});
