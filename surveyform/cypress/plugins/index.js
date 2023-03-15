/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const cypressTypeScriptPreprocessor = require("./cy-webpack-preprocessor");
const loadEnv = require("./load-env");
const mail = require("./mail");

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const fileProcessors = [];
  fileProcessors.push(cypressTypeScriptPreprocessor);

  on("file:preprocessor", ...fileProcessors);

  loadEnv(on, config);
  mail(on, config);

  // When testing with Chrome, we force english to avoid issue
  on("before:browser:launch", (browser = {}, launchOptions) => {
    console.log("Launching browser", browser.name);
    if (browser.name === "chrome") {
      // https://github.com/cypress-io/cypress/issues/7890
      // doesn't seem to work...
      launchOptions.args.push("--lang=en-US");
      return launchOptions;
    }
  });

  return config;
};
