/**
 * RUN yarn dev:test and NOT just yarn dev! We need to enable the email mocks
 *
 */
import { testSurvey } from "~/surveys/testSurvey";
import { routes } from "~/lib/routes";
// Set to english (NOTE: this won't work in before.ts)
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";
import { startSurveyButtonName } from "../../helpers/selectors";
import { apiRoutes } from "~/lib/apiRoutes";
import { getCreateAccountButton } from "../../helpers/getters";

beforeEach(() => {
  // NOTE: those operations are expensive! When testing less-critical part of your UI,
  // prefer mocking API calls! We do this only because auth is very critical
  cy.exec("yarn run db:test:reset");
  cy.exec("yarn run db:test:seed");
  cy.task("resetEmails");

  // Set the page to english
  // NOTE: this would be better in  "cypress/support/before.ts" but importing i18n lib won't work
  // @see https://github.com/scottohara/loot/issues/185
  cy.setCookie(LOCALE_COOKIE_NAME, "en-US");
  // logout
  cy.clearCookie("token");
});
after(() => {
  // clean the db when done
  cy.exec("yarn run db:test:reset");
  cy.exec("yarn run db:test:seed");
});

const test = it;

const CURRENT_SURVEY_REGEX = new RegExp(`${testSurvey.name}`, "i");
const CURRENT_SURVEY_URL = `/${testSurvey.prettySlug}/${testSurvey.year}`;

// Check the email content
// TODO: not the best regexp in the world... we match the href part of the html link, with the last "
const magicLinkRegex = `(http|https)://(?<domain>.+)/account/magic-login\\?token=.*"`;

test("Access state of 2022, magic auth new user", () => {
  cy.visit("/");
  cy.findByRole("link", { name: CURRENT_SURVEY_REGEX }).click();
  const surveyRootUrl = routes.survey.root.href + CURRENT_SURVEY_URL;
  cy.url().should("match", new RegExp(surveyRootUrl));

  cy.intercept({
    method: "POST",
    // we still need to add * to match any query params
    url: `${apiRoutes.account.magicLogin.sendEmail.href}*`,
  }).as("sendEmailRequest");

  const email = "test@test.test";
  cy.findByLabelText(/email/i).type(email /*Cypress.env("ADMIN_EMAIL")*/);
  getCreateAccountButton().click();

  // Check that the request succeeded
  cy.wait("@sendEmailRequest");
  cy.get("@sendEmailRequest").its("response.body").should("exist");

  // Then, we check for the verification email to be sent
  cy.task("getLastEmail", email).then((emailBody: string) => {
    // FIXME: doesn't pass yet because the mail is never caught by "mail.js", not sure why
    cy.wrap(emailBody).should("not.be.null");
    const magicLinkMatch = emailBody.match(magicLinkRegex);
    cy.wrap(magicLinkMatch).should("exist");
    const magicLink = (magicLinkMatch?.[0] as string)
      // remove the last "
      .slice(0, -1);
    const magicLinkUrl = new URL(magicLink);

    // token = resetLink.groups.token

    // Verify the token
    cy.intercept({
      method: apiRoutes.account.magicLogin.verifyToken.method,
      url: apiRoutes.account.magicLogin.verifyToken.href + "*",
    }).as("verifyToken");

    cy.visit(magicLink);
    cy.wait("@verifyToken");
    //cy.get("@verifyToken").its("request.body").should("deep.equal", { token });
    cy.get("@verifyToken").its("response.body").should("exist"); // wait for the response to be there

    // User is redirected quickly so no need to check for this text
    //cy.findByText(/successfully verified/i).should("exist");

    const token = magicLinkUrl.searchParams.get("token") as string; // equivalent to getting the 2nd item
    const from = magicLinkUrl.searchParams.get("from") as string;

    cy.url().should("match", new RegExp(from));
    cy.findByRole("button", { name: startSurveyButtonName }).should("exist");
  });
});

test("Access state of 2022, magic auth existing admin user", () => {
  cy.visit("/");
  cy.findByRole("link", { name: CURRENT_SURVEY_REGEX }).click();
  const surveyRootUrl = routes.survey.root.href + CURRENT_SURVEY_URL;
  cy.url().should("match", new RegExp(surveyRootUrl));

  cy.intercept({
    method: "POST",
    // we still need to add * to match any query params
    url: `${apiRoutes.account.magicLogin.sendEmail.href}*`,
  }).as("sendEmailRequest");

  const email = Cypress.env("ADMIN_EMAIL");
  cy.findByLabelText(/email/i).type(email);
  getCreateAccountButton().click();

  // Check that the request succeeded
  cy.wait("@sendEmailRequest");
  cy.get("@sendEmailRequest").its("response.body").should("exist");

  // Then, we check for the verification email to be sent
  cy.task("getLastEmail", email).then((emailBody: string) => {
    // FIXME: doesn't pass yet because the mail is never caught by "mail.js", not sure why
    cy.wrap(emailBody).should("not.be.null");
    const magicLinkMatch = emailBody.match(magicLinkRegex);
    cy.wrap(magicLinkMatch).should("exist");
    const magicLink = (magicLinkMatch?.[0] as string)
      // remove the last "
      .slice(0, -1);
    const magicLinkUrl = new URL(magicLink);

    // token = resetLink.groups.token

    // Verify the token
    cy.intercept({
      method: apiRoutes.account.magicLogin.verifyToken.method,
      url: apiRoutes.account.magicLogin.verifyToken.href + "*",
    }).as("verifyToken");

    cy.visit(magicLink);
    cy.wait("@verifyToken");
    //cy.get("@verifyToken").its("request.body").should("deep.equal", { token });
    cy.get("@verifyToken").its("response.body").should("exist"); // wait for the response to be there

    // User is redirected quickly so no need to check for this text
    //cy.findByText(/successfully verified/i).should("exist");

    const token = magicLinkUrl.searchParams.get("token") as string; // equivalent to getting the 2nd item
    const from = magicLinkUrl.searchParams.get("from") as string;

    cy.url().should("match", new RegExp(from));
    cy.findByRole("button", { name: startSurveyButtonName }).should("exist");
  });
});
