// @see https://bun.sh/docs/cli/test
// TODO: make node:test work with TS to avoid depending on Bun ?
// Run this file with bun test
import { test, expect } from "bun:test"
import { TokenExpr } from "./tokenExpr"

const makeCtx = () => ({
    editionId: "html2022", surveyId: "state_of_html"
})
test("html2022.foobar matches {{editionId}}.foobar, but no other edition", () => {
    const te = new TokenExpr("{{editionId}}.foobar", makeCtx())
    expect(te.match("html2022.foobar")).toBeTrue()
    // incorrect year
    expect(te.match("html2023.foobar")).toBeFalse()
})
test("wildcard matches any param", () => {
    const te = new TokenExpr("{{*}}.title", makeCtx())
    expect(te.match("hello.title")).toBeTrue()
    expect(te.match("hello.nope")).toBeFalse()
})