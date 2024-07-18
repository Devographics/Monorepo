// Super naive logic to translate "{{surveyId}}.foobar" into "state_of_html.foobar"
// To be improved and optimized
/**
 * "{{surveyId}}.foobar" => html2023.foobar
 * "[[chart_type]].foobar" => ["bar_chart.foobar", "pie_chart.foobar"]
 * "{{*}}.foobar" => null (we don't resolve wildcard in advance)
 * @param tExpr 
 * @param ctx 
 * @returns 
 */
// function resolve(tExpr: string, ctx: { surveyId: string, editionId: string }): string | Array<string> | null {
//     return tExpr
//         .replaceAll(/\{\{surveyId\}\}/g, ctx.surveyId)
//         .replaceAll(/\{\{editionId\}\}/g, ctx.editionId);
// }


export class TokenExpr<TContext extends Record<string, any>> {
    expr: string
    regex: RegExp
    constructor(expr: string, ctx: TContext) {
        this.expr = expr
        if (typeof expr !== "string") {
            if (Array.isArray(expr)) {
                throw new Error(`Got an array instead of a token expression: ${expr}. 
You probably forgot to spread this array.`)
            }
            throw new Error(`Got a non string Token expression: ${expr}`)
        }
        this.regex = new RegExp(expr
            // preserves "dots"
            .replaceAll(".", "\\.")
            // replace contextual values by their actual value
            // TODO: guess automatically from context
            .replaceAll(/\{\{surveyId\}\}/g, ctx["surveyId"])
            .replaceAll(/\{\{editionId\}\}/g, ctx["editionId"])
            // replace wild cards by regex wild cards
            // survey.*.foobar
            .replaceAll(/\*/g, "(.*)")
            + "$" // match full word
            ,
            "i"
        )
    }
    /**
     * html2023.foobar should match "{{surveyId}}.foobar", if current survey is HTML 2023
     * pie_chart.foobar should match "[[chart_type]].foobar", if possible chart_types are ["pie_chart", "bar_chart"]
     * hello.title should match "{{*}}.title" wildcard
     * @param token 
     * @returns 
     */
    match(token: string) {
        // TODO: this is a super naive implementation only supporting surveyId, editionId
        // Instead we should transform the token expression into a grammar or a kind of regex, depending on the context
        // so "{{surveyId}}.foobar" becomes "html2023.foobar" (literally)
        // and "[[chart_type]].foobar" becomes "/(pie_chart|bar_chart).title/"
        // and "{{*}}.foobar" becomes /(.*).title/

        return this.regex.test(token)
    }
}
