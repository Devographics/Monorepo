// Avoid explicit
import { test, expect } from "@jest/globals"
import { getClosestLocale } from "./locales"

test("fr-CA gives fr-FR", () => {
    expect(getClosestLocale("fr-CA")).toEqual("fr-FR")
})