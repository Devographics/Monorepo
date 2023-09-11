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
if (!serverConfig().isDev) {
  transport = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: !!process.env.SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true
  };
} else {
  console.warn("SMTP_HOST not set, will use debug transport")
}

export const localMailTransport = nodemailer.createTransport(transport);
