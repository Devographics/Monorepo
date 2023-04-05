/**
 * Full workflow from home for a user that is already
 * signed up
 */
import { testSurvey } from "../../fixtures/testSurvey";
// Set to english (NOTE: this won't work in before.ts)
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";

beforeEach(() => {
  //  // NOTE: those operations are expensive! When testing less-critical part of your UI,
  //  // prefer mocking API calls! We do this only because auth is very critical
  //  cy.exec("pnpm run db:test:reset");
  //  cy.exec("pnpm run db:test:seed");
  //  //cy.task("resetEmails");
  //
  //  // Set the page to english
  //  // NOTE: this would be better in  "cypress/support/before.ts" but importing i18n lib won't work
  //  // @see https://github.com/scottohara/loot/issues/185
  cy.setCookie(LOCALE_COOKIE_NAME, "en-US");
});
//after(() => {
//  // clean the db when done
//  cy.exec("pnpm run db:test:reset");
//  cy.exec("pnpm run db:test:seed");
//});

const test = it;

const CURRENT_SURVEY_REGEX = new RegExp(`${testSurvey.name}`, "i");
const CURRENT_SURVEY_URL = `/${testSurvey.prettySlug}/${testSurvey.year}`;

test("Access 2021 survey", () => {
  // surveys before 2021 are not supported (no questions.yml)
  cy.visit("/")
  // an older survey
  cy.findByText(/state of javascript 2021/i).click()
  cy.url().should("match", /survey\/state-of-js\/2021/)
  cy.findByText(/now closed/i).should("be.visible")

})
test("access 2022 survey", () => {
  cy.visit("/")
  // a survey pre-next 13
  cy.findByText(/state of graphql 2022/i).click()
  cy.url().should("match", /survey\/state-of-graphql\/2022/)
  cy.findByText(/now closed/i).should("be.visible")
})


test.skip("accessing a closed survey with an account that did not exist should return an empty read-only form", () => {
  cy.visit("/survey/state-of-js/2022")
  cy.findByText(/now closed/i).should("be.visible")
  // TODO: auth with email, reuse logic from magicLogin
})
test.skip("accessing closed survey should load response", () => {
  // TODO: a tad complicated to test, we need to first create a response for a closed survey in the db
})