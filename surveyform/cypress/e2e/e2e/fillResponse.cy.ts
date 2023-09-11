/**
 * Test various types of inputs
 */
import { testSurvey } from "../../fixtures/testSurvey";
import { routes } from "~/lib/routes";
// Set to english (NOTE: this won't work in before.ts)
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";
// TODO: define a webpack alias for Cypress code
import {
  getContinueAsGuestButton,
  getLinkToSection,
  getQuestionBlock,
} from "../../helpers/getters";

function accessDemoSurvey() {
  const surveyRootUrl = routes.survey.demo.href
  cy.visit(surveyRootUrl);
  getContinueAsGuestButton().click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  // TODO: replace by the english label when i18n is there
  // FIXME: this is not language resistant...
  // @see https://github.com/cypress-io/cypress/issues/7890
  cy.url().should("match", new RegExp(surveyRootUrl + "/.+"));
}
function finishSurvey() {
  // skip to last section
  // finish
  cy.findByRole("button", {
    name: /Finish survey|general\.finish_survey/i,
  }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  cy.url().should("match", new RegExp("thanks"));
}

beforeEach(() => {
  // NOTE: those operations are expensive! When testing less-critical part of your UI,
  // prefer mocking API calls! We do this only because auth is very critical
  cy.exec("pnpm run db:test:reset");
  cy.exec("pnpm run db:test:seed");
  //cy.task("resetEmails");

  // Set the page to english
  // NOTE: this would be better in  "cypress/support/before.ts" but importing i18n lib won't work
  // @see https://github.com/scottohara/loot/issues/185
  cy.setCookie(LOCALE_COOKIE_NAME, "en-US");

  accessDemoSurvey()
});
afterEach(() => {
  finishSurvey()
})
after(() => {
  // clean the db when done
  cy.exec("pnpm run db:test:reset");
  cy.exec("pnpm run db:test:seed");
});

const test = it;

const CURRENT_SURVEY_REGEX = new RegExp(`${testSurvey.name}`, "i");
const CURRENT_SURVEY_URL = `/${testSurvey.prettySlug}/${testSurvey.year}`;


test("features", () => {
  accessDemoSurvey()
  // Features
  getLinkToSection(/feature/i).click({ force: true })
  getQuestionBlock(
    /demo_feature\./i
  ).within(() => {
    // "Used" radio
    // TODO: doesn't work with regex it seems
    cy.findByLabelText(
      /I've used it|^used$/,
      // not exact because we need the emoji also
      { exact: false }
    ).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  });
})

test("multiple checkboxes", () => {
  // Tools/multiple
  getLinkToSection(/multiple/i).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  // Click a checkboxgroup
  cy.findByRole("heading", {
    name: /demo_multiple\./i,
  })
    .parent()
    .within(() => {
      // "Used" radio
      cy.findByRole("checkbox", { name: /multiple\.one/i }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
      cy.findByRole("checkbox", { name: /multiple\.two/i }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
    });

  // TODO: multipleWithOther
  /*
  getQuestionBlock("client_type").within(() => {
    cy.findByRole("input", { name: "other" })
    // TODO: filling text should create multiple "others"?
    // @see https://github.com/Devographics/surveys/discussions/185
  })
  */
})

test("various fields", () => {
  // Various inputs (slider etc.)
  getLinkToSection(/various_fields/i).click({ force: true })
  getQuestionBlock(/slider/i).within(() => {
    cy.findByRole("radio", { name: /2/i }).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  })
  // Click a bracket
  // Be careful not to match "Others GraphQL strong points", that's why we need a ^ and a $
  getQuestionBlock(
    /^GraphQL Strong Points|demo_survey__usage__graphql_strong_points$/i
  ).within(() => {
    /*
    TODO: bracket is not yet fully updated
      // TODO: order is random so hard to test, we would need more
      // logic to find siblings
      cy.findByRole("button", {
        name: /Type-checking|options\.graphql_strong_points\.type_checking/i,
      }).click({force:true}); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
    */
  });
})

test("text", () => {
  // Fill a text area
  // TODO: better style
  /*
  getQuestionBlock(/Other Strong Points|Graphql_demo__usage__strong_points__others/i).within(() => {
  
  })*/

  // Fill a text input
  /*
  cy.findByRole("button", {
    // Next section: update depending on the survey
    name: /next section|sections\.directives\.title/i,
  }).click({force:true}); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  */
  // Provide personal info
  // Fill autocomplete
})
test("demographics", () => {
  // Demographics
  getLinkToSection(/About|user_info/i).click({ force: true }); // FIXME: normally Cypress auto scroll to the element but it stopped working somehow
  getQuestionBlock(/Country|user_info__country/i).within(() => {
    cy.findByRole("combobox").select("France");
  });

})

test("experimental", () => {
  // Experimental inputs
  getLinkToSection(/experimental/i).click({ force: true })
  getQuestionBlock(/textlist/i).within(() => {
    // Initial state: 1 empty input
    // There are no items, only a "last item"
    // Blurring should work ok (do nothing)
    cy.findByRole("textbox").focus().blur()
    // Fill => it creates a new input afterwards
    cy.findByRole("textbox").focus().type("1").blur()
    cy.findAllByRole("textbox").should("have.length", 2)
    cy.findAllByRole("textbox").last().focus().type("2").blur()
    // Current state: ["1", "2", additionaly empty input]
    // pressing enter in an "intermediate" input should create a new one
    // (only for "inputs", not textarea)
    cy.findAllByRole("textbox").first().focus().type("{enter}")
    cy.findAllByRole("textbox").eq(1).should("be.empty")
    cy.findAllByRole("textbox").eq(1).focus().type("1.1").blur()
    // Curent state: ["1", "1.1", "2.2", empty last input]
    // deleting will go back to the last item (we must delete all text + press backspace again)
    cy.findAllByRole("textbox").eq(1).type("{backspace}{backspace}{backspace}{backspace}")
    cy.findAllByRole("textbox").eq(1).should("have.value", "2")
    // TODO: how to check that previous item is focused?
    // deleting the first item will focus on the next item (instead of the previous one)
    // Current state: ["1", "2", empty input]
    cy.findAllByRole("textbox").first().focus().type("{backspace}{backspace}")
    // TODO: check that next item is indeed focused
    cy.findAllByRole("textbox").first().should("have.value", "2")
    // Current state: ["2", empty input]

    // TODO: test that blurring the whole div remove empty elements
    // TODO: test defualt limit
    // TODO: test mroe edge cases
  })
})

