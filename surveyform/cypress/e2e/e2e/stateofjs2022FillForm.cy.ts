/**
 * Test various types of inputs
 */
import { testSurvey } from "../../fixtures/testSurvey";
import { routes } from "~/lib/routes";
// Set to english (NOTE: this won't work in before.ts)
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";
// TODO: define a webpack alias for Cypress code
import {
  getContinueAsGuestButton,
  getLinkToSection,
  getQuestionBlock,
} from "../../helpers/getters";

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
  const surveyRootUrl = routes.survey.root.href + CURRENT_SURVEY_URL;
  cy.visit(surveyRootUrl);

  getContinueAsGuestButton().click();
  // TODO: replace by the english label when i18n is there
  // FIXME: this is not language resistant...
  // @see https://github.com/cypress-io/cypress/issues/7890
  cy.findByRole("button", {
    name: /start_survey|start survey/i,
  }).click();
  cy.url().should("match", new RegExp(surveyRootUrl + "/.+"));

  // Click a radio button
  getQuestionBlock(
    /Custom Directives|demo_survey__features__custom_directives__experience/i
  ).within(() => {
    // "Used" radio
    // TODO: doesn't work with regex it seems
    cy.findByLabelText(
      /I've used it|^used$/,
      // not exact because we need the emoji also
      { exact: false }
    ).click();
  });

  // Click a checkboxgroup
  getLinkToSection(/Usage|sections\.usage\.title/i).click();
  cy.findByRole("heading", {
    name: /API Types|demo_survey__usage__api_type__choices/i,
  })
    .parent()
    .within(() => {
      // "Used" radio
      cy.findByRole("checkbox", { name: /Public|public_apis/i }).click();
      cy.findByRole("checkbox", { name: /Private|private_apis/i }).click();
      //cy.findByLabelText("public_apis").click();
      //cy.findByLabelText("private_apis").click();
    });

  // Click a bracket
  // Be careful not to match "Others GraphQL strong points", that's why we need a ^ and a $
  getQuestionBlock(
    /^GraphQL Strong Points|demo_survey__usage__graphql_strong_points$/i
  ).within(() => {
    // TODO: order is random so hard to test, we would need more
    // logic to find siblings
    cy.findByRole("button", {
      name: /Type-checking|options\.graphql_strong_points\.type_checking/i,
    }).click();
  });

  // Fill a text area
  // TODO: better style
  /*
  getQuestionBlock(/Other Strong Points|Graphql_demo__usage__strong_points__others/i).within(() => {

  })*/

  // Fill a text input
  /*
  cy.findByRole("button", {
    // Next section: update depending on the survey
    name: /next section|sections\.directives\.title/i,
  }).click();
  */
  // Provide personal info
  // Fill autocomplete

  // Select a combobox
  getLinkToSection(/About|user_info/i).click();
  getQuestionBlock(/Country|user_info__country/i).within(() => {
    cy.findByRole("combobox").select("France");
  });

  // skip to last section
  // finish
  cy.findByRole("button", {
    name: /Finish survey|general\.finish_survey/i,
  }).click();
  cy.url().should("match", new RegExp("thanks"));
});
