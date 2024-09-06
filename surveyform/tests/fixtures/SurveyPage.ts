import type { Page, Locator } from '@playwright/test';

export class SurveyPage {
  // private readonly inputBox: Locator;
  // private readonly todoItems: Locator;
  prettySlug = "demo-survey"
  year = 2022
  status = 2
  name = "Demo survey"
  surveyId = "demo_survey"
  editionId = "demo2022"


  surveyRegex() { return new RegExp(`${this.name}`, "i") }
  surveyUrl() {
    return `/${this.prettySlug}/${this.year}`;
  }


  constructor(public readonly page: Page) {
    // this.inputBox = this.page.locator('input.new-todo');
    // this.todoItems = this.page.getByTestId('todo-item');
  }

  /**
   * Get section div based on inner h3
   * @param titleName
   * @returns
   */
  async getQuestionBlock(titleName: string | RegExp) {
    return this.page.getByRole("heading", {
      name: titleName,
    })
      .locator("..")
    //.parent();
  };

  /** Use nav links, automatically open the navigation menu */
  async getLinkToSection(sectionName: string | RegExp) {
    await this.openNavigationMenu()
    return this.page.getByRole("link", {
      name: sectionName,
    });
  };

  async getContinueAsGuestButton() {
    return this.page.getByRole("button", {
      name: /Continue as Guest|accounts\.continue_as_guest\.action|without email/i,
      // timeout: 10000, // avoid flaky test when the page is still loading
    });
  };

  async getCreateAccountButton() {
    return this.page.getByRole("button", {
      name: /Continue with Account|accounts\.create_account\.action/i,
    });
  };

  tocButton() {
    // TODO: not surte about the button name,
    // it uses the table_of_content translation token
    // TODO: button is only shown on mobile
    return this.page.getByRole("button", { name: /table_of_content|table of contents|%d sections/i })
  }
  async isTocOpen() {
    const tocElem = await this.tocButton().elementHandle()
    // getAttribute will wait for the attribute to exist
    // but here we want an immediate check
    try {
      return (await tocElem?.getAttribute("aria-expanded")) === "true"
    } catch (err) {
      return false
    }
  }
  async openNavigationMenu() {
    // TODO: only needed on mobile
    /*
    if (!(await this.isTocOpen())) {
      await this.tocButton().click()
    }*/
  }

  /*
  https://playwright.dev/docs/test-fixtures
  Demo of a page object model in Playwright
  async addToDo(text: string) {
    await this.inputBox.fill(text);
    await this.inputBox.press('Enter');
  }

  async remove(text: string) {
    const todo = this.todoItems.filter({ hasText: text });
    await todo.hover();
    await todo.getByLabel('Delete').click();
  }

  async removeAll() {
    while ((await this.todoItems.count()) > 0) {
      await this.todoItems.first().hover();
      await this.todoItems.getByLabel('Delete').first().click();
    }
  }
    */
}

