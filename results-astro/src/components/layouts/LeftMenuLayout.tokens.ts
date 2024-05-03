import { tokensAsMap } from "@/lib/i18n/utils"

const tokenExpressions = [
    "general.skip_to_content",
    "general.open_nav",
    // Not really used but just an experiment
    // The server render takes care of selection the right translation
    // so <T token="{{surveyId}}.test" /> will become "This is the State of HTML survey" for instance
    // general.css2023.results_intro
    // TODO: one difficulty is that we may forget what editionId is? it can be confusing to match the token expr and actual tokens
    "general.{{editionId}}.results_intro"
] as const

export const tokensMap = tokensAsMap(tokenExpressions)
export default tokenExpressions