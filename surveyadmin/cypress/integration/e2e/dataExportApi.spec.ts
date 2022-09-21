import { apiRoutes } from "~/lib/apiRoutes";

beforeEach(() => {
  // NOTE: those operations are expensive! When testing less-critical part of your UI,
  // prefer mocking API calls! We do this only because auth is very critical
  // NOTE: when running "dev:test", we could maybe spawn a faster in-memory mongo database?
  cy.exec("yarn run db:test:reset");
  cy.exec("yarn run db:test:seed");
  cy.clearCookie("token");
});
after(() => {
  // clean the db when done
  cy.exec("yarn run db:test:reset");
  cy.exec("yarn run db:test:seed");
});

const test = it;

test("cannot call data export API without being logged in", () => {
  cy.request({
    method: "POST",
    url: apiRoutes.admin.dataExport.href,
    // we specificallly test a failure
    failOnStatusCode: false,
  })
    .its("status")
    .should("equal", 401);
});

test("cannot call data export API without being logged as admin", () => {
  cy.request({
    method: "POST",
    url: apiRoutes.admin.dataExport.href,
    // we specificallly test a failure
    failOnStatusCode: false,
  })
    .its("status")
    .should("equal", 401);
});

test("cannot call data export API with GET", () => {
  cy.request({
    method: "GET",
    url: apiRoutes.admin.dataExport.href,
    // we specificallly test a failure
    failOnStatusCode: false,
  })
    .its("status")
    .should("equal", 404);
});

test.skip("can export as admin", () => {
  cy.request("POST", apiRoutes.account.login.href, {
    email: Cypress.env("ADMIN_EMAIL"),
    password: Cypress.env("ADMIN_INITIAL_PASSWORD"),
  });
  cy.request({
    method: "POST",
    url: apiRoutes.admin.dataExport.href,
  })
    .its("status")
    .should("equal", 200);
});
