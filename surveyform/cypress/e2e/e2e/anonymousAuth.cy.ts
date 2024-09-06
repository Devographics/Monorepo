import { testSurvey } from "../../fixtures/testSurvey";
import { routes } from "~/lib/routes";
// Set to english (NOTE: this won't work in before.ts)
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";
import { startSurveyButtonName } from "../../helpers/selectors";

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
  // logout
  cy.clearCookie("token");
});
after(() => {
  // clean the db when done
  cy.exec("pnpm run db:test:reset");
  cy.exec("pnpm run db:test:seed");
});

const test = it;

const CURRENT_SURVEY_REGEX = new RegExp(`${testSurvey.name}`, "i");
const CURRENT_SURVEY_URL = `/${testSurvey.prettySlug}/${testSurvey.year}`;
test("Access state of 2022, anonymous auth", () => {
  cy.visit("/");
  cy.findByRole("link", { name: CURRENT_SURVEY_REGEX }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  const surveyRootUrl = "en-US" + routes.survey.root.href + CURRENT_SURVEY_URL;
  cy.url().should("match", new RegExp(surveyRootUrl));
  getContinueAsGuestButton().click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  cy.url().should("match", new RegExp(surveyRootUrl + "/.+"));
  // skip to last section
  getLinkToSection(/About You|sections\.user_info\.title/i).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  cy.url().should("match", new RegExp(surveyRootUrl + "/.+" + "/\\d+"));
  getLinkToSection(/Finish survey|general\.finish_survey/i).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  cy.url().should("match", new RegExp("finish"));
});

test("open login page directly", () => {
  cy.visit("/account/login")
  getContinueAsGuestButton().click()
  cy.url().should("match", new RegExp(routes.home.href))
})