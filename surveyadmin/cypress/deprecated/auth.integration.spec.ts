/**
 * NOTE: those are integration test, so actual requests can be mocked
 * See e2e folder for testing against the actual api
 */
import { apiRoutes } from "~/lib/apiRoutes";
import { routes } from "~/lib/routes";
it("redirect back to from page after login", () => {
  // TODO: mock the auth request with MSW and Cypress instead of actually login in
  cy.intercept(
    apiRoutes.account.login.method as any,
    `${apiRoutes.account.login.href}`,
    {
      statusCode: 200,
      body: { done: true },
    }
  );
  cy.intercept(
    apiRoutes.account.user.method as any,
    `${apiRoutes.account.user.href}`,
    {
      statusCode: 200,
      body: { user: null },
    }
  );
  cy.visit(
    `${routes.account.login.href}?from=${encodeURIComponent(
      routes.survey.root.href
    )}`
  );
  cy.findByLabelText(/email/i).type(Cypress.env("ADMIN_EMAIL"));
  cy.findByLabelText(/password/i).type(Cypress.env("ADMIN_INITIAL_PASSWORD"));
  cy.findByRole("button", { name: /login$/i }).click();
  cy.url().should("match", new RegExp(routes.survey.root.href));
  // NOTE: since we do a fake auth its ok that user is redirected back to login at the end
});
