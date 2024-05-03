// This must replicate the list of components used by ReactContextLayout
// this is tedious to maintain but the best we can do yet
import { tokensAsMap } from "@/lib/i18n/utils"
import leftMenuLayoutTokens from "./LeftMenuLayout.tokens"

const tokenExpressions = ["some.token"] as const

/** We expose only the tokens specific to this component,
 * this map is used only by ReactContextLayout component
*/
export const tokensMap = tokensAsMap(tokenExpressions)

/**
 * We expose both the tokens specific to this component,
 * and the tokens of its children, 
 * so the dependencies are propagated
 * This array is used by the top level server-side data fetching logic
 * to filter tokens
 */
export default [...leftMenuLayoutTokens]
