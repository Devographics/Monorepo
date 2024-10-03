import { test, expect } from "@jest/globals"
import {
  getLocaleFromAcceptLanguage,
  getReqAcceptLanguage,
} from "../localeDetection";

test("can parse accept-language header", () => {
  const req1 = {
    headers: {
      "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8",
    },
  } as any;
  const req2 = {
    headers: {
      "accept-language": "ru,en-US;q=0.1",
    },
  } as any;
  expect(getLocaleFromAcceptLanguage(getReqAcceptLanguage(req1))).toEqual(
    "fr-FR"
  );
  expect(getLocaleFromAcceptLanguage(getReqAcceptLanguage(req2))).toEqual("ru");
});
