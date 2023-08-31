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
test("Access demo survey 2022, signup, start filling form", () => {
  const surveyRootUrl = routes.survey.root.href + CURRENT_SURVEY_URL;
  cy.visit(surveyRootUrl);

  getContinueAsGuestButton().click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  // TODO: replace by the english label when i18n is there
  // FIXME: this is not language resistant...
  // @see https://github.com/cypress-io/cypress/issues/7890
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
    ).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  });

  // Go to usage section
  getLinkToSection(/Usage|sections\.usage\.title/i).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  // Click a checkboxgroup
  cy.findByRole("heading", {
    name: /API Types|demo_survey__usage__api_type__choices/i,
  })
    .parent()
    .within(() => {
      // "Used" radio
      cy.findByRole("checkbox", { name: /Public|public_apis/i }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
      cy.findByRole("checkbox", { name: /Private|private_apis/i }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
    });

  // TODO: multipleWithOther
  /*
  getQuestionBlock("client_type").within(() => {
    cy.findByRole("input", { name: "other" })
    // TODO: filling text should create multiple "others"?
    // @see https://github.com/Devographics/surveys/discussions/185
  })
  */

  // Click a "slider"
  getQuestionBlock(/demo_balance_slider/i).within(() => {
    cy.findByRole("radio", { name: /2/i }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  })

  // Click a bracket
  // Be careful not to match "Others GraphQL strong points", that's why we need a ^ and a $
  getQuestionBlock(
    /^GraphQL Strong Points|demo_survey__usage__graphql_strong_points$/i
  ).within(() => {
    /*
    TODO: bracket is not yet fully updated
      // TODO: order is random so hard to test, we would need more
      // logic to find siblings
      cy.findByRole("button", {
        name: /Type-checking|options\.graphql_strong_points\.type_checking/i,
      }).click({force:true}); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
    */
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
  }).click({force:true}); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  */
  // Provide personal info
  // Fill autocomplete

  // Select a combobox
  getLinkToSection(/About|user_info/i).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  getQuestionBlock(/Country|user_info__country/i).within(() => {
    cy.findByRole("combobox").select("France");
  });

  // skip to last section
  // finish
  cy.findByRole("button", {
    name: /Finish survey|general\.finish_survey/i,
  }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  cy.url().should("match", new RegExp("thanks"));
});
