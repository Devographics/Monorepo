/* eslint-disable no-console */

import fetch from "node-fetch";
import { serverConfig } from "~/config/server";

const apiKey = process.env.EMAIL_OCTOPUS_APIKEY;

/**
 * Subscribe a user to the mailing list
 */
export async function subscribe({ email, confirm = false, listId }) {
  try {
    if (!(apiKey && listId)) {
      if (
        !serverConfig().isProd
      ) {
        console.warn(
          "EMAIL_OCTOPUS_APIKEY or listId not set, current NODE_ENV:",
          process.env.NODE_ENV,
          process.env.NEXT_PUBLIC_NODE_ENV
        );
        return;
      } else {
        throw new Error(
          "Octopus EMAIL_OCTOPUS_APIKEY or listId not set in production, can't subscribe user."
        );
      }
    }
    // subscribe user
    const body = {
      api_key: apiKey,
      email_address: email,
      status: "SUBSCRIBED",
    };
    const subscribe = await fetch(
      `https://emailoctopus.com/api/1.5/lists/${listId}/contacts`,
      {
        method: "post",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }
    );
    const json: any = await subscribe.json();
    if (json.error) {
      throw json.error;
    }
    // const subscribe = await mailchimp.post(`/lists/${listId}/members`, subscribeOptions);
    // const subscribe = callSyncAPI('lists', 'subscribe', subscribeOptions);
    return { result: "subscribed", ...json };
  } catch (error) {
    const name = error.code;
    const message = error.message;
    throw Error(message);
  }
}

// remove a user to a MailChimp list.
// called from the user's account
export async function unsubscribe(email) {
  // not available
  throw Error(`Unsubscribe not implemented yet`);
}

export async function send({ subject, text, html, isTest = false }) {
  // not available
  throw Error(
    `EmailOctopus API doesn't support sending campaigns currently (June 2020)`
  );
}
