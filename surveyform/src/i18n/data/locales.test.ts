import { getClosestLocale } from "./locales"

test("fr-CA gives fr-FR", () => {
    expect(getClosestLocale("fr-CA")).toEqual("fr-FR")
})