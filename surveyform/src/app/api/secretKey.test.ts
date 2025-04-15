// Test must run with
import { NextRequest } from "next/server";
// @ts-ignore
import { test, expect, spyOn, mock } from "bun:test";
import { checkSecretKey } from "./secretKey";

test("key and secret key must match", () => {
  // "spyOn(target, prop) does not support accessor properties yet"
  //const spy = spyOn(process, "env", ["SECRET_KEY"])
  //spy.value("SOME-KEY")
  const key = process.env.SECRET_KEY;
  process.env.SECRET_KEY = "SOME-KEY";
  expect(() =>
    checkSecretKey(new NextRequest("http://localhost:3000"))
  ).toThrow();
  expect(() =>
    checkSecretKey(new NextRequest("http://localhost:3000?key="))
  ).toThrow();
  expect(() =>
    checkSecretKey(new NextRequest("http://localhost:3000?key=WRONG-KEY"))
  ).toThrow();
  expect(
    checkSecretKey(new NextRequest("http://localhost:3000?key=SOME-KEY"))
  ).toBe(true);
  //mock.restore()
  process.env.SECRET_KEY = key;
});
test("cron_secret must match", () => {
  // const spy = spyOn(process, "env", ["CRON_SECRET"])
  // spy.value("CRON-KEY")
  const key = process.env.CRON_SECRET;
  const isVercel = process.env.VERCEL;
  process.env.CRON_SECRET = "CRON-KEY";
  process.env.VERCEL = "1";
  expect(() =>
    checkSecretKey(new NextRequest("http://localhost:3000"))
  ).toThrow();
  expect(() =>
    checkSecretKey(
      new NextRequest("http://localhost:3000", {
        headers: {
          Authorization: "",
        },
      })
    )
  ).toThrow();
  expect(() =>
    checkSecretKey(
      new NextRequest("http://localhost:3000", {
        headers: {
          Authorization: "Bearer INCORRECT-KEY",
        },
      })
    )
  ).toThrow();
  expect(
    checkSecretKey(
      new NextRequest("http://localhost:3000", {
        headers: {
          Authorization: "Bearer CRON-KEY",
        },
      })
    )
  ).toBe(true);
  // mock.restore()
  process.env.CRON_SECRET = key;
  process.env.VERCEL = isVercel;
});
