import type { Translation } from "@devographics/i18n";
import { TokenExpr } from "./tokenExpressions";

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
export function filterClientSideStrings(allStrings: Array<Translation>, rawExprs: Array<string>, ctx: { surveyId: string, editionId: string }): Array<Translation> {
    let clientSideStrings: Record<string, string> = {};
    // Parse expressions
    const tExprs = rawExprs.map((rawExpr) => new TokenExpr(rawExpr, ctx))
    // Helps figuring unmatched values
    let matchedExprs = new Set<TokenExpr>();
    allStrings.forEach((str) => {
        // Try to match a token expression from the client
        const matchedExpr = tExprs.find((tExpr) => tExpr.match(str.key));
        if (matchedExpr) {
            if (clientSideStrings[matchedExpr.expr]) {
                // Duplicates, warn
                console.warn(
                    `Token expression ${matchedExpr.expr} (matched by ${str.key}) was already matched, previous value: "${clientSideStrings[matchedExpr.expr]}", new value: "${str.t}"`,
                );
            }
            matchedExprs.add(matchedExpr);
            // The token key will be "{{surveyId}}.foobar"
            // and NOT the resolved "html2022.foobar"
            // This way the client doesn't have to bother injecting the right value,
            // it can use token expressions with contextual values directly
            clientSideStrings[matchedExpr.expr] = str.t;
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
    return Object.entries(clientSideStrings).map(([key, t]) => ({ key, t } as Translation))
}