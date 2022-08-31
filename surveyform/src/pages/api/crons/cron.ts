// @see https://github.com/paulphys/nextjs-cron
import moment from "moment";
//import { CronJob } from "cron";
import { normalizeJob } from "~/admin/server/normalization/cronjob";
import { getEntitiesData } from "~/admin/server/normalization/helpers";
// import { exportEmailsJob } from "~/server/users/cronjob";
import { apiWrapper } from "~/lib/server/sentry";

const runCrons = process.env.RUN_CRONS; //getSetting("runCrons", false);

const allCrons = async () => {
  if (runCrons) {
    // eslint-disable-next-line no-console
    console.log(
      `[Running cron jobs at ${moment().format("YYYY/MM/DD, hh:mm")}]`
    );
    const { entities, rules } = await getEntitiesData();
    await normalizeJob({ entities, rules });
    // TODO: reenable later
    //await exportEmailsJob();
  }
};
async function handler(req, res) {
  try {
    //  /!\ We suppose that the _middleware already secures the call!
    // /!\ The job must not be too big, as it runs in a serverless environment
    await allCrons;
    res.status(200).json({ success: "true" });
  } catch (err) {
    res.status(500);
  }
}

/**
 *  Instead we now use Github Actions
 */
// new CronJob(
//   // '0 * * * *', // run every hour
//   "*/10 * * * *", // run every 10 min
//   Meteor.bindEnvironment(function () {
//     allCrons();
//   }),
//   null,
//   true,
//   "Asia/Tokyo"
// );
//

export default apiWrapper(handler);
