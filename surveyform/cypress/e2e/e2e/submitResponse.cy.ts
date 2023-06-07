/**
 * Full workflow from home for a user that is already
 * signed up
 */
import { testSurvey } from "../../fixtures/testSurvey";
import { routes } from "~/lib/routes";
// Set to english (NOTE: this won't work in before.ts)
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";
import { getContinueAsGuestButton, getLinkToSection } from "../../helpers/getters";

before(() => {
  // NOTE: those operations are expensive! When testing less-critical part of your UI,
  // prefer mocking API calls! We do this only because auth is very critical
  cy.exec("pnpm run db:test:reset");
  cy.exec("pnpm run db:test:seed");
  //cy.task("resetEmails");

  // Set the page to english
  // NOTE: this would be better in  "cypress/support/before.ts" but importing i18n lib won't work
  // @see https://github.com/scottohara/loot/issues/185
  cy.setCookie(LOCALE_COOKIE_NAME, "en-US");
});
after(() => {
  // clean the db when done
  cy.exec("pnpm run db:test:reset");
  cy.exec("pnpm run db:test:seed");
});

const test = it;

const CURRENT_SURVEY_REGEX = new RegExp(`${testSurvey.name}`, "i");
const CURRENT_SURVEY_URL = `/${testSurvey.prettySlug}/${testSurvey.year}`;
test("Access state of 2022, signup, start filling form", () => {
  cy.visit("/");
  cy.findByRole("link", { name: CURRENT_SURVEY_REGEX }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  const surveyRootUrl = routes.survey.root.href + CURRENT_SURVEY_URL;
  cy.url().should("match", new RegExp(surveyRootUrl));
  // NOTE: it's not a good practice to test auth by UI,
  // so do it only once. If more tests are needed, either auth using
  // the API or mock auth (via currentUser endpoint)

  getContinueAsGuestButton().click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow

  // TODO: replace by the english label when i18n is there
  // FIXME: this is not language resistant...
  // @see https://github.com/cypress-io/cypress/issues/7890
  cy.findByRole("button", {
    name: /start_survey|start survey|commencer à répondre/i,
  }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  cy.url().should("match", new RegExp(surveyRootUrl + "/.+"));
  // click 1st section
  const secondSectionButtonName = /Directives|sections\.directives\.title/i;
  cy.findByRole("button", {
    name: secondSectionButtonName,
  }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  cy.url().should("match", new RegExp(surveyRootUrl + "/.+" + "/2"));
  // skip to last section
  getLinkToSection(/About You|sections\.user_info\.title/i).click()
  cy.url().should("match", new RegExp(surveyRootUrl + "/.+" + "/\\d+"));
  // finish
  cy.findByRole("button", {
    name: /Finish survey|general\.finish_survey/i,
  }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  cy.url().should("match", new RegExp("finish"));
});
