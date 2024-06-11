import { tokens as tokensStandaloneMagicLoginForm } from "~/account/magicLogin/components/StandaloneMagicLoginForm.tokens"

export const tokens = [
  "accounts.create_account",
  "accounts.create_account.description",
  "accounts.create_account.action",
  "accounts.create_account.note",
  "accounts.continue_as_guest",
  "accounts.continue_as_guest.description",
  "accounts.continue_as_guest.action",
  ...tokensStandaloneMagicLoginForm
] as const