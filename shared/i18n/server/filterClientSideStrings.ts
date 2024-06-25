import type { LocaleParsed, Translation } from "../typings";
import { TokenExpr } from "../tokenExpr";
import { EOL } from "os"
import { logToFile } from "@devographics/debug"


class Meta {
    /** 
     * I've tried using an AsyncLocalStorage context,
     * but "enterWith" doesn't work and "run" is as cumbersome as just passing a value around
     */
    pageName: string
    /** tokens requested by client components */
    rawTokenExprs: Array<string>
    /**  translations from backend */
    translations: Array<Translation>
    // sets of matches, as strings
    matchedExprs = new Set<string>();
    matchedTransKeys = new Set<string>();
    /** token expression, translation key, translation value (raw .t) */
    matches: Array<[string, string, string]> = []
    constructor(translations: Array<Translation>, rawTokenExprs: Array<string>, pageName: string = "unknown_page") {
        this.rawTokenExprs = rawTokenExprs
        this.translations = translations
        this.pageName = pageName
    }
    logMatch(trans: Translation, tokenExpr: string) {
        this.matchedTransKeys.add(trans.key)
        this.matchedExprs.add(tokenExpr)
        // NOTE: if "t" is empty maybe try tClean, tHtml?
        this.matches.push([tokenExpr, trans.key, trans.t || ""])
    }
    _unmatchedExprs() {
        const missingTokens = this.rawTokenExprs.filter(
            (te) => !this.matchedExprs.has(te));
        return missingTokens
    }
    _unmatchedTrans() {
        const unusedTrans = this.translations.filter(
            (t) => !this.matchedTransKeys.has(t.key));
        return unusedTrans

    }

    async logDebugToCsvFile() {
        // TODO: also include the context where the translation comes from
        const rows = []
        // 1. add token expressions that are not matched (problem)
        this._unmatchedExprs().forEach(expr => {
            rows.push([expr, "NOT FOUND", "No tokens from the server dictionnary was matching this token expression. 1) the expression may not be correct 2) the token may not exist 3) you may not load the correct translation contexts."])
        })
        // 2. add matches (for debugging)
        rows.push(...this.matches)
        // 3. add unmatched translation key (it's normal that some are filtered but could help remove older ones)
        this._unmatchedTrans().forEach(t => {
            rows.push(["UNUSED", t.key,
                t.t
                    // escape CSV separator, quotes and newlines
                    .replaceAll('"', '""').replaceAll(",", '","').replaceAll(/[\r\n]+/g, " ")])
        })
        const header = "tokenExpr,translationKey,t"
        const lines = rows.map(r => r.join(","))
        const csv = [header, ...lines].join(EOL)
        let fileName = `tokens_page_${this.pageName.replaceAll(/\\\/\[\]/g, "_")}.csv`
        await logToFile(fileName, csv)
    }
}

/**
 * 
 * @param allStrings Tokens from the backend
 * @param rawExprs Token expressions used by React client components
 * Note: we don't need to filter tokens for server components (RSC, .astro)
 * @param ctx Contextual values ~ they acts as macro that are injected in the tokens expressions
 * because we don't have macros in JavaScript
 * and even if we had macros this system is more powerful and can handle range of values etc.
 * @returns Record of strings to be used client-side
 * 
 * /!\ keys are the token expressions so "{{surveyId}}.foobar" and NOT "html2023.foobar"
 * This may create a slight mismatch with how pure server components work for now,
 * we need to study that later on, maybe use token expressions in RSCs/Astro components too
 */
export function filterClientSideStrings<TContext extends Record<string, any>>(
    locale: LocaleParsed,
    rawExprs: Array<string>,
    ctx: TContext,
    /** Metadata for debugging */
    meta?: {
        /** Avoid special chars here */
        pageName?: string
    }
): LocaleParsed {
    const translations = Object.values(locale.dict)
    const logger = new Meta(translations, rawExprs, meta?.pageName)
    let clientSideDict: typeof locale.dict = {}
    // Parse expressions
    const tExprs = rawExprs.map((rawExpr) => new TokenExpr<TContext>(rawExpr, ctx))
    // Helps figuring unmatched values
    translations.forEach((trans: Translation) => {
        // Try to match a token expression from the client
        const matchedExpr = tExprs.find((tExpr) => tExpr.match(trans.key));
        if (matchedExpr) {
            logger.logMatch(trans, matchedExpr.expr)
            // The token key will be "{{surveyId}}.foobar"
            // and NOT the resolved "html2022.foobar"
            // This way the client doesn't have to bother injecting the right value,
            // it can use token expressions with contextual values directly
            clientSideDict[matchedExpr.expr] = trans;
            // clientSideStrings[str.k] = str.t
        }
    });
    // To support legacy string list
    const clientSideStrings = locale.strings?.filter(({ key }) => key in clientSideDict)
    logger.logDebugToCsvFile().catch(err => {
        console.error("Error while logging to CSV file", err)
    })
    // Use the same shape as strings
    return {
        ...locale,
        /** TODO: for now we pass the array representation but it should be removed later on */
        strings: clientSideStrings,
        dict: clientSideDict
    }
}