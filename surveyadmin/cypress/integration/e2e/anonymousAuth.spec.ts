import { testSurvey } from "~/surveys/testSurvey";
import { routes } from "~/lib/routes";
// Set to english (NOTE: this won't work in before.ts)
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";
import { startSurveyButtonName } from "../../helpers/selectors";
import { getContinueAsGuestButton } from "../..//helpers/getters";

beforeEach(() => {
  // NOTE: those operations are expensive! When testing less-critical part of your UI,
  // prefer mocking API calls! We do this only because auth is very critical
  cy.exec("yarn run db:test:reset");
  cy.exec("yarn run db:test:seed");
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
  cy.exec("yarn run db:test:reset");
  cy.exec("yarn run db:test:seed");
});

const test = it;

const CURRENT_SURVEY_REGEX = new RegExp(`${testSurvey.name}`, "i");
const CURRENT_SURVEY_URL = `/${testSurvey.prettySlug}/${testSurvey.year}`;
test("Access state of 2022, anonymous auth", () => {
  cy.visit("/");
  cy.findByRole("link", { name: CURRENT_SURVEY_REGEX }).click();
  const surveyRootUrl = routes.survey.root.href + CURRENT_SURVEY_URL;
  cy.url().should("match", new RegExp(surveyRootUrl));
  getContinueAsGuestButton().click();
  // TODO: replace by the english label when i18n is there
  // FIXME: this is not language resistant...
  // @see https://github.com/cypress-io/cypress/issues/7890
  cy.findByRole("button", {
    name: startSurveyButtonName,
  }).click();
  cy.url().should("match", new RegExp(surveyRootUrl + "/.+"));
  // skip to last section
  cy.findByRole("link", {
    name: /About You|sections\.user_info\.title/i,
  }).click();
  cy.url().should("match", new RegExp(surveyRootUrl + "/.+" + "/\\d+"));
  // finish
  cy.findByRole("button", {
    name: /Finish survey|general\.finish_survey/i,
  }).click();
  cy.url().should("match", new RegExp("thanks"));
});
