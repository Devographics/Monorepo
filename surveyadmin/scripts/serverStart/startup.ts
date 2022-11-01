/*

Startup

TODO: shouldn't they be run on-demand instead of running at app startup?

*/
import * as scripts from "~/server/scripts";
// import { convertAllYAML } from "~/server/yaml";
// import { loadProjects } from "~/server/projects";
// import { logAllRules } from "~/server/normalization/helpers";
//import { normalizeJob } from "~/server/normalization/cronjob";
//import { exportEmailsJob } from "~/server/users/cronjob";

const startup = []; //getSetting("startup", []);
const environment = process.env.NODE_ENV; //getSetting("environment");

const runScripts = Boolean(process.env.RUN_SCRIPTS); //getSetting("runScripts", false);

export async function onStartup() {
  // todo
  // await initLocales();
  if (runScripts) {
    // await normalizeJob();
    // TODO: reenable later on
    //await exportEmailsJob();

    if (environment === "development") {
      console.info("Running development only scripts");
      // await convertAllYAML();
      // await logAllRules();
    }

    // await loadProjects();

    // await scripts.renameGraphQL2022Fields();
    // await scripts.renormalizeGraphQL2022();
    // await scripts.addChoicesSuffixToUserInfoFields()
    // await scripts.fixChoicesChoices()

    // for some reason JSON arrays are of the form: { '0': 'testScript', '1': 'testScript2' },
    // convert it to regular array first to make things easier
    const scriptsToRun = Object.keys(startup).map((k) => startup[k]);
    console.log(`// Found ${scriptsToRun.length} startup scripts to run`); // eslint-disable-line
    for (const script of scriptsToRun) {
      console.log(`// Running script ${script}… (${new Date()})`); // eslint-disable-line
      try {
        const f = scripts[script];
        await f();
      } catch (error) {
        console.log(`-> error while running script ${script}:`); // eslint-disable-line
        console.log(error); // eslint-disable-line
      }
    }
  } else {
    console.info(
      `// Not running startup scripts (process.env.RUN_SCRIPTS=${process.env.RUN_SCRIPTS})`
    );
  }
}
