//**** API TESTS
// TODO: those tests should be replaced by tests against API routes when this is more mature in Next (no need to use a browser here)
import { apiRoutes } from "~/lib/apiRoutes";
import { testSurvey } from "../../fixtures/testSurvey";

const test = it

// Must be seeded in the db
const TEST_USER_EMAIL = "test@devographics.com";

// @see https://stackoverflow.com/questions/63457717/how-can-i-call-fetch-from-within-a-cypress-test
// wrap null, so that you can use `then` to invoke a callback as an arbitrary command
// and return a Cypress.Promise - so that cypress will wait on it's result
// (or just use cy.request :))
const cyfy = (func: any, thenOptions?: any) =>
  cy.wrap(null).then(thenOptions, () => {
    return new Cypress.Promise((resolve, reject) => {
      try {
        func().then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  });

describe("survey - API", () => {
  beforeEach(() => {
    // NOTE: those operations are expensive! When testing less-critical part of your UI,
    // prefer mocking API calls! We do this only because auth is very critical
    // NOTE: when running "dev:test", we could maybe spawn a faster in-memory mongo database?
    cy.exec("pnpm run db:test:reset");
    cy.exec("pnpm run db:test:seed");
    cy.task("resetEmails");
    cy.clearCookie("token");
  });
  after(() => {
    // clean the db when done
    cy.exec("pnpm run db:test:reset");
    cy.exec("pnpm run db:test:seed");
  });

  test.skip("authenticated user starts survey", () => {
    // TODO: authenticate user
    cy.request({
      method: "POST",
      url: apiRoutes.response.saveSurvey.href({ surveyId: testSurvey.surveyId, editionId: testSurvey.editionId }),
      body: {
        data: {}
      },
      // we specificallly test a failure
      failOnStatusCode: false,
    })
      .its("status")
      .should("equal", 200);
  })
  test.skip("cannot start closed survey", () => {
    // TODO
  })
  test("unauthenticated user cannot start survey", () => {
    cy.request({
      method: "POST",
      url: apiRoutes.response.saveSurvey.href({ surveyId: testSurvey.surveyId, editionId: testSurvey.editionId }),
      body: {
        data: {}
      },
      // we specificallly test a failure
      failOnStatusCode: false,
    })
      .its("status")
      .should("equal", 401);
  })
})