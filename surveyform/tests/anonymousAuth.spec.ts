import { test, expect } from "@playwright/test";
// TODO: handle imports
// import { routes } from "~/lib/routes";
import { SurveyPage } from "./fixtures/SurveyPage";
import { execSync } from "child_process";

let surveyPage: SurveyPage;
test.beforeEach(async ({ page, context }) => {
  // NOTE: we could use Playwright fixture system instead of before/after
  // @see https://playwright.dev/docs/test-fixtures
  surveyPage = new SurveyPage(page);
  // NOTE: those operations are expensive! When testing less-critical part of your UI,
  // prefer mocking API calls! We do this only because auth is very critical
  execSync("pnpm run db:test:reset");
  execSync("pnpm run db:test:seed");
  //cy.task("resetEmails");
  // logout
  await context.clearCookies();
});
// TODO: can be a bit costly to run for each test, but there is no file-level "after" in playwright
test.afterEach(() => {
  // clean the db when done
  execSync("pnpm run db:test:reset");
  execSync("pnpm run db:test:seed");
});

test("Access test survey, anonymous auth", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: surveyPage.surveyRegex() }).click();
  const surveyRootUrl =
    "en-US" + /*routes.survey.root.href*/ "/survey" + surveyPage.surveyUrl();
  await page.waitForURL(new RegExp(surveyRootUrl));
  await (await surveyPage.getContinueAsGuestButton()).click();
  await page.waitForURL(new RegExp(surveyRootUrl + "/.+"));
  // skip to last section
  await (
    await surveyPage.getLinkToSection(/About You|sections\.user_info\.title/i)
  ).click();
  await page.waitForURL(new RegExp(surveyRootUrl + "/.+" + "/\\d+"));
  // TODO: we seem to miss the i18n token here
  // await (await surveyPage.getLinkToSection(/Finish survey|general\.finish_survey/i)).click();
  // await page.waitForURL(new RegExp("finish"));
});

test("open login page directly", async ({ page }) => {
  await page.goto("/account/login");
  await (await surveyPage.getContinueAsGuestButton()).click();
  await page.waitForURL(new RegExp("/" /*routes.home.href*/));
});
