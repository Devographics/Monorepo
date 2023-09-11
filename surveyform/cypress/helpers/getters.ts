import { curry } from "cypress/types/lodash";

/**
 * Get section div based on inner h3
 * @param titleName
 * @returns
 */
export const getQuestionBlock = (titleName: string | RegExp) => {
  return cy
    .findByRole("heading", {
      name: titleName,
    })
    .parent();
};
/** Use nav links, automatically open the navigation menu */
export const getLinkToSection = (sectionName: string | RegExp) => {
  openNavigationMenu()
  return cy.findByRole("link", {
    name: sectionName,
  });
};

export const getContinueAsGuestButton = () => {
  return cy.findByRole("button", {
    name: /Continue as Guest|accounts\.continue_as_guest\.action|without email/i,
    timeout: 10000, // avoid flaky test when the page is still loading
  });
};

export const getCreateAccountButton = () => {
  return cy.findByRole("button", {
    name: /Continue with Account|accounts\.create_account\.action/i,
  });
};

export const openNavigationMenu = () => {
  cy.findByRole("button", { name: /table_of_content|table of contents/i }).as("tocBtn")
    .then($btn => {
      if ($btn.attr("aria-expanded") !== "true") {
        return cy.get("@tocBtn").click()
      }
    })
}