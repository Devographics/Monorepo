import { NextPageParams } from "~/app/typings";
import { MagicLoginChecker } from "./MagicLoginChecker";
import { tokens as tokensMagicLoginChecker } from "./MagicLoginChecker.tokens";
import { CenteredContainer } from "~/components/ui/CenteredContainer";
import { rscLocaleFromParams } from "~/lib/api/rsc-fetchers";
import { filterClientSideStrings } from "@devographics/i18n/server";
import { I18nContextProvider } from "@devographics/react-i18n";

const clientTokens = [...tokensMagicLoginChecker]

export default async function MagicLoginCheckPage({
  params,
  searchParams,
}: NextPageParams<
  { lang: string },
  { token: string; redirectTo?: string; editionId?: string; surveyId?: string }
>) {
  const { locale, error } = await rscLocaleFromParams(params)
  if (error) return <div>Can't load translations</div>
  const clientSideLocale = filterClientSideStrings<{}>(locale, clientTokens, {}, { pageName: "magic_login" })

  const { token, redirectTo, editionId, surveyId } = searchParams;
  if (!token) throw new Error("No magic token found in query params.");
  return (
    <I18nContextProvider locale={clientSideLocale}>
      <CenteredContainer>
        <MagicLoginChecker
          token={token}
          redirectTo={redirectTo}
          editionId={editionId}
          surveyId={surveyId}
        />
      </CenteredContainer>
    </I18nContextProvider>
  );
}
