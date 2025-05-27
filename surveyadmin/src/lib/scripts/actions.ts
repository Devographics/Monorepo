import * as allScripts from "~/scripts";
import { measureTime } from "@devographics/helpers";

export const getScripts = async () => {
  return Object.keys(allScripts).map((id) => {
    const script = allScripts[id];
    return {
      id,
      description: script.description,
      args: script.args,
      done: script.done,
      deprecated: script.deprecated,
      category: script.category,
    };
  });
};

export const runScript = async (args) => {
  const { id, scriptArgs } = args;
  if (!id) {
    throw new Error("No script id specified");
  }
  console.log(`📜 running script ${id}…`);
  const script = allScripts[id];
  const result = await measureTime(
    async () => await script(scriptArgs),
    `runScript ${id}`
  );
  return result;
};
