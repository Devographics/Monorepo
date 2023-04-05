//**** API TESTS
// TODO: those tests should be replaced by tests against API routes when this is more mature in Next (no need to use a browser here)
import {
  sendMagicLoginEmail,
  verifyMagicToken,
} from "~/account/magicLogin/lib";
import { loginAnonymously } from "~/account/anonymousLogin/lib";
import { magicLinkRegex } from "../../helpers/magicLogin";
import { apiRoutes } from "~/lib/apiRoutes";

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
describe("auth - API", () => {
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

  describe("send magic link", () => {
    // Send email
    it("do not send verification email if email is not provided", () => {
      cy.request({
        method: "POST",
        url: apiRoutes.account.magicLogin.sendEmail.href,
        body: { wrong: "foo" },
        // we specificallly test a failure
        failOnStatusCode: false,
      })
        .its("status")
        .should("equal", 400);
    });
    it("hits rate limit", () => {
      cyfy(
        async () => {
          const uniqueEmail = new Date().getTime() + "@RATE.LIMIT";
          let latestRes;
          for (let i = 0; i < 1000; i++) {
            latestRes = await sendMagicLoginEmail({ destination: uniqueEmail });
            if (latestRes.status === 429) {
              return latestRes;
            }
          }
          return latestRes;
        },
        { timeout: 10000 }
      )
        // TODO: ideally we would quit when the status is 429
        .its("status")
        .should("equal", 429);
    });
    it("sends verification email for non-existing user", () => {
      cyfy(() => sendMagicLoginEmail({ destination: "test@test.test" }))
        .its("status")
        .should("equal", 200);
    });
    it("sends verification email for existing user", () => {
      const email = TEST_USER_EMAIL;
      cyfy(() => sendMagicLoginEmail({ destination: email }))
        .its("status")
        .should("equal", 200);
    });
    it("adds anonymousId to new user when sending email", () => {
      const email = "test@test.test";
      cyfy(() => loginAnonymously())
        .as("anonymousLogin")
        .then(async (res: any) => {
          const result = await res.json();
          cy.wrap(result).its("userId").should("exist");
          cyfy(() =>
            sendMagicLoginEmail({
              destination: email,
              anonymousId: result.userId,
            })
          )
            .its("status")
            .should("equal", 200);
        });
    });
    it("adds anonymousId to existing user when sending email", () => {
      const email = TEST_USER_EMAIL;
      cyfy(() => loginAnonymously())
        .as("anonymousLogin")
        .then(async (res: any) => {
          const result = await res.json();
          cy.wrap(result).its("userId").should("exist");
          cyfy(() =>
            sendMagicLoginEmail({
              destination: email,
              anonymousId: result.userId,
            })
          )
            .its("status")
            .should("equal", 200);
        });
    });
  });

  // Verify
  // TODO: this require interception emails
  it("fails if a wrong token is provided", () => {
    // NOTE: it's easier to test failing cases with cy than with raw fetch
    cy.request({
      method: "GET",
      url: apiRoutes.account.magicLogin.verifyToken.href + "?token=adjjd",
      // we expect a failure here
      failOnStatusCode: false,
    }).as("wrongToken");
    // NOTE: it's a 500, not a 401
    cy.get("@wrongToken").its("status").should("equal", 500);
  });
  it("create new verified user when verifying magic link", () => {
    // 1. get a token
    const email = "test@test.test";
    cyfy(() => sendMagicLoginEmail({ destination: email }))
      // Wait  for request to finish and succeed otherwise the mail won't be there yet
      .its("status")
      .should("equal", 200);
    cy.task("getLastEmail", email).then((emailBody: string) => {
      const magicLinkMatch = emailBody.match(magicLinkRegex);
      cy.wrap(magicLinkMatch).should("exist");
      const magicLink = (magicLinkMatch?.[0] as string)
        // remove the last "
        .slice(0, -1);
      const magicLinkUrl = new URL(magicLink);
      const token = magicLinkUrl.searchParams.get("token");
      if (!token) throw new Error("Cannot get token");

      console.log("token", token);
      // 2. verify
      cyfy(() => verifyMagicToken(token))
        .its("status")
        .should("equal", 200);
    });
  });
  it.skip("makes existing user verified user when verifying magic link", () => { });
  it("adds anonymousId to new user when verifying token", () => {
    const email = "test@test.test";
    cyfy(() => loginAnonymously())
      .as("anonymousLogin")
      .then(async (anonRes: any) => {
        const result = await anonRes.json();
        cy.wrap(result).its("userId").should("exist");
        const anonymousId = result.userId;
        // TODO: log anonymous
        // 1. get a token
        const email = "test@test.test";
        cyfy(() => sendMagicLoginEmail({ destination: email, anonymousId }))
          // Wait  for request to finish and succeed otherwise the mail won't be there yet
          .its("status")
          .should("equal", 200);
        cy.task("getLastEmail", email).then((emailBody: string) => {
          const magicLinkMatch = emailBody.match(magicLinkRegex);
          cy.wrap(magicLinkMatch).should("exist");
          const magicLink = (magicLinkMatch?.[0] as string)
            // remove the last "
            .slice(0, -1);
          const magicLinkUrl = new URL(magicLink);
          const token = magicLinkUrl.searchParams.get("token");
          if (!token) throw new Error("Cannot get token");
          // 2. verify
          cyfy(() => verifyMagicToken(token, anonymousId))
            .its("status")
            .should("equal", 200);

          // TODO: check in the db that the user has the right id
        });
      });
  });
  it.skip("adds anonymousId to existing user when verifying token", () => { });
});
