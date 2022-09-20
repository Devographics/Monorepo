// Not working either...
// @see https://github.com/cypress-io/cypress/issues/7890#issuecomment-824676390
Cypress.on("test:before:run", () => {
  Cypress.automation("remote:debugger:protocol", {
    command: "Emulation.setLocaleOverride",
    params: {
      locale: "en-US",
    },
  });
});
