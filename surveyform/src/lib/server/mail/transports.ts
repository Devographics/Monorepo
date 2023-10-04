import nodemailer from "nodemailer";
import { serverConfig } from "~/config/server";

/**
 * Default transport is the console, for debugging purpose
 * @see https://nodemailer.com/transports/stream/
 */
let transport: any = {
  streamTransport: true,
  newline: "unix",
  buffer: true,
  debug: true,
};
if (!(serverConfig().isDev || serverConfig().debugMail)) {
  transport = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true,
  };
} else {
  console.warn("SMTP_HOST not set, will use debug transport");
}

export const localMailTransport = nodemailer.createTransport(transport);
