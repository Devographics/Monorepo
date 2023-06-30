/**
 * Full workflow from home for a user that is already
 * signed up
 */
// Set to english (NOTE: this won't work in before.ts)
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";
import { routes } from "~/lib/routes";

beforeEach(() => {
  cy.setCookie(LOCALE_COOKIE_NAME, "en-US");
});

const test = it;


// TODO: there is no link to 2021 survey, access via URL instead
test.skip("Access 2021 survey", () => {
  // surveys before 2021 are not supported (no questions.yml)
  cy.visit("/survey/state-of-js/2021")
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
  cy.findByText(/closed on/i).should("be.visible")
})
test("accessing a closed survey with an account that did not exist should return an empty outline form", () => {
  cy.visit("/survey/state-of-js/2022")
  cy.findByText(/closed on/i).should("be.visible")
  cy.visit(routes.survey.outline.href({ slug: "state-of-js", year: "2022" }))
  // TODO: auth with email, reuse logic from magicLogin
})

test.skip("accessing closed survey should load response", () => {
  // TODO: a tad complicated to test, we need to first create a response for a closed survey in the db
})