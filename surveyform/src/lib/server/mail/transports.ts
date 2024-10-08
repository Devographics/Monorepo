import nodemailer from "nodemailer";
import { serverConfig } from "~/config/server";

/**
 * Default transport is the console, for debugging purpose
 * @see https://nodemailer.com/transports/stream/
 */
let transport: any;
if (!!process.env.SMTP_DEBUG_LOCAL) {
  console.warn("SMTP_DEBUG_LOCAL enabled, using debug transport, mails will be logged in the server console");
  transport = {
    streamTransport: true,
    newline: "unix",
    buffer: true,
    debug: true,
  };
} else {
  transport = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: false,
  };
}

export const localMailTransport = nodemailer.createTransport(transport);
