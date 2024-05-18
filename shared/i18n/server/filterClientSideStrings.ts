import type { LocaleParsed, Translation } from "../typings";
import { TokenExpr } from "../tokenExpr";



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
    ctx: TContext): LocaleParsed {
    const allStrings = Object.values(locale.dict)
    let clientSideDict: typeof locale.dict = {}
    // Parse expressions
    const tExprs = rawExprs.map((rawExpr) => new TokenExpr<TContext>(rawExpr, ctx))
    // Helps figuring unmatched values
    let matchedExprs = new Set<TokenExpr<TContext>>();
    allStrings.forEach((trans: Translation) => {
        // Try to match a token expression from the client
        const matchedExpr = tExprs.find((tExpr) => tExpr.match(trans.key));
        if (matchedExpr) {
            if (clientSideDict[matchedExpr.expr]) {
                // Duplicates, warn
                console.warn(
                    `Token expression ${matchedExpr.expr} (matched by ${trans.key}) was already matched, 
                    previous value: "${clientSideDict[matchedExpr.expr]}", 
                    new value: "${trans.t}"`,
                );
            }
            matchedExprs.add(matchedExpr);
            // The token key will be "{{surveyId}}.foobar"
            // and NOT the resolved "html2022.foobar"
            // This way the client doesn't have to bother injecting the right value,
            // it can use token expressions with contextual values directly
            clientSideDict[matchedExpr.expr] = trans;
            // clientSideStrings[str.k] = str.t
        }
    });
    const missingTokens = tExprs.filter(
        (te) => !matchedExprs.has(te));
    if (missingTokens.length) {
        console.warn(
            "Some token expressions required by client components, were not matched",
            missingTokens,
        );
    }
    // Use the same shape as strings
    return {
        ...locale,
        dict: clientSideDict
    }
}