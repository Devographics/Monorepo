import { tokens as tokensLayout } from "~/components/common/Layout.tokens"
import { tokens as tokensUserMessages } from "~/components/common/UserMessagesContext.tokens"
/** Reexport i18n tokens from children to allow filtering client-side translations */
export const tokens = [...tokensLayout, ...tokensUserMessages]