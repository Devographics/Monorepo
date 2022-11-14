import { NextApiRequest } from "next";

export const getRootUrl = (req: NextApiRequest) => {
  const { headers } = req;
  // TODO: this might not be the most robust approach when a proxy/gateway is setup
  return headers.origin;
};

export const getSizeInKB = (obj) => {
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  // Get the length of the Uint8Array
  const bytes = new TextEncoder().encode(str).length;
  return Math.round(bytes / 1000);
};

export const measureTime = async (f, log) => {
  const startAt = new Date();
  const result = await f();
  const endAt = new Date();
  console.log(
    `🕚 ${log} in ${endAt.getTime() - startAt.getTime()}ms (${getSizeInKB(
      result
    )}kb)`
  );
  return result;
};