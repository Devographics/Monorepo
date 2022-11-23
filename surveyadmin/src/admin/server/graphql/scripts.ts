import * as allScripts from "~/scripts";
import { measureTime } from "~/lib/server/utils";
import { isAdmin } from "@vulcanjs/permissions";
import isEmpty from "lodash/isEmpty.js";

export const scripts = async (root, args, context) => {
  if (!isAdmin(context.currentUser)) {
    throw new Error("You cannot perform this operation");
  }
  return Object.keys(allScripts).map((id) => {
    const script = allScripts[id]
    return { id, description: script.description, args: script.args, done: script.done}
  });
};

export const runScript = async (root, { id, scriptArgs }, { currentUser }) => {
  if (!isAdmin(currentUser)) {
    throw new Error("You cannot perform this operation");
  }
  console.log(`📜 running script ${id}…`);
  if (!isEmpty(scriptArgs)) {
    console.log(scriptArgs);
  }
  const script = allScripts[id];
  const result = await measureTime(
    async () => await script(scriptArgs),
    `runScript ${id}`
  );
  return result;
};
