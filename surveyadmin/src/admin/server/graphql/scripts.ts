import * as allScripts from "~/scripts";
import { measureTime } from "~/lib/server/utils";
import { isAdmin } from "@vulcanjs/permissions";

export const scripts = async (root, args, context) => {
  if (!isAdmin(context.currentUser)) {
    throw new Error("You cannot perform this operation");
  }
  return Object.keys(allScripts).map((id) => ({ id }));
};

export const runScript = async (root, args, { currentUser }) => {
  if (!isAdmin(currentUser)) {
    throw new Error("You cannot perform this operation");
  }
  const { id, scriptArgs } = args;
  console.log(`📜 running script ${id}…`);
  console.log(scriptArgs)
  const script = allScripts[id];
  const result = await measureTime(
    async () => await script(scriptArgs),
    `runScript ${id}`
  );
  return result;
};
