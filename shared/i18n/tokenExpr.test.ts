import { test, expect } from "vitest"
import { TokenExpr } from "./tokenExpr"

const makeCtx = () => ({
    editionId: "html2022", surveyId: "state_of_html"
})
test("html2022.foobar matches {{editionId}}.foobar, but no other edition", () => {
    const te = new TokenExpr("{{editionId}}.foobar", makeCtx())
    expect(te.match("html2022.foobar")).toBe(true)
    // incorrect year
    expect(te.match("html2023.foobar")).toBe(false)
})
test("substring 'foobar' doesn't match complete string 'foobar.action", () => {
    const te = new TokenExpr("foobar", makeCtx())
    expect(te.match("foobar")).toBe(true)
    // suffix, it's not the same string
    expect(te.match("foobar.action")).toBe(false)

})
test("wildcard matches any param", () => {
    const te = new TokenExpr("*.title", makeCtx())
    expect(te.match("hello.title")).toBe(true)
    expect(te.match("hello.nope")).toBe(false)
})