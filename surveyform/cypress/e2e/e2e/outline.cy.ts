/**
 * Full workflow from home for a user that is already
 * signed up
 */
import { testSurvey } from "../../fixtures/testSurvey";
// Set to english (NOTE: this won't work in before.ts)
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";
import { curry } from "cypress/types/lodash";
import { routes } from "~/lib/routes";

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

// TODO: there is no link to 2021 survey, access via URL instead
test("access open survey outline", () => {
  const surveyRootUrl = routes.survey.root.href + CURRENT_SURVEY_URL;
  cy.visit(routes.survey.outline.href({ slug: testSurvey.prettySlug, year: testSurvey.year + "", section: 12 }))
  // TODO: go to last section => it should NOT display the "finish" button
})