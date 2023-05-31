//**** API TESTS
// TODO: those tests should be replaced by tests against API routes when this is more mature in Next (no need to use a browser here)
import { loginAnonymously } from "~/account/anonymousLogin/lib";
import { apiRoutes } from "~/lib/apiRoutes";
import { testSurvey } from "../../fixtures/testSurvey";
import { logout } from "~/account/user/client-fetchers/logout";

const test = it

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

before(() => {
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

function getId(res: Cypress.Response<any>) {
  // TODO: this complex structure is due to using GraphQL, simplify
  return res?.body?.data?._id
}

test("unauthenticated can't get response", () => {
  // TODO: this is done in new route handlers but the legacy endpoints return a 200
  cy.request({
    method: "GET",
    url: apiRoutes.responses.loadResponse.href({ responseId: "124" }),
    failOnStatusCode: false

  }).its("status").should("equal", 401)
})
// start and save
test("authenticated user starts then update survey", () => {
  cyfy(loginAnonymously).its("status").should("equal", 200)
  cy.request({
    method: "POST",
    url: apiRoutes.responses.createResponse.href(),
    body: {
      surveyId: testSurvey.surveyId,
      editionId: testSurvey.editionId,
      // TODO: pass actual data, and get the response back to see if they were saved
      //myAnswer: "foobar"
    },
  }).then(res => {
    expect(res.status).to.eq(200)
    expect(getId(res)).to.have.length.greaterThan(0)
    const responseId = getId(res)
    cy.request({
      method: "POST",
      url: apiRoutes.responses.saveResponse.href({ responseId }),
      body: {
        // TODO: is it a partial or full-update? I think partial
        // TODO: pass actual data, and get the response back to see if they were saved
        data: {}
      },
    })
      .its("status")
      .should("equal", 200);

  })
})
test("cannot start closed survey", () => {
  cyfy(loginAnonymously).its("status").should("equal", 200)
  cy.request({
    method: "POST",
    url: apiRoutes.responses.createResponse.href(),
    body: {
      surveyId: "state_of_js",
      editionId: "js2022"
    },
    failOnStatusCode: false
  }).its("status").should("equal", 400)
})
test("unauthenticated user cannot start survey", () => {
  cy.request({
    method: "POST",
    url: apiRoutes.responses.createResponse.href(),
    body: {
      surveyId: testSurvey.surveyId,
      editionId: testSurvey.editionId,
    },
    // we specificallly test a failure
    failOnStatusCode: false,
  })
    .its("status")
    .should("equal", 401);
})
test("authenticated or unauthenticated users cannot save someone else survey", () => {
  // start the survey and get its id
  cyfy(loginAnonymously).its("status").should("equal", 200)
  cy.request({
    method: "POST",
    url: apiRoutes.responses.createResponse.href(),
    body: {
      surveyId: testSurvey.surveyId,
      editionId: testSurvey.editionId,
    },
  }).then(res => {
    const responseId = getId(res)
    expect(responseId).to.have.length.greaterThan(0)
    // logout
    cyfy(logout)
    cy.request({
      method: "POST",
      url: apiRoutes.responses.saveResponse.href({ responseId }),
      body: {
        data: {}
      },
      // we specificallly test a failure
      failOnStatusCode: false,
    })
      .its("status")
      .should("equal", 401);
    // login again
    cyfy(loginAnonymously).its("status").should("equal", 200)
    cy.request({
      method: "POST",
      url: apiRoutes.responses.saveResponse.href({ responseId }),
      body: {
        data: {}
      },
      // we specificallly test a failure
      //failOnStatusCode: false,
    })
    // TODO: setup a 403 status
    //.its("status")
    //.should("equal", 403);
  })
})

