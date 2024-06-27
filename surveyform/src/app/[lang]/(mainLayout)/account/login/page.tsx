import { filterClientSideStrings } from "@devographics/i18n/server";
import { I18nContextProvider } from "@devographics/react-i18n";
import { LoginDialog } from "~/account/LoginDialog";
import { tokens as tokensLoginDialog } from "~/account/LoginDialog.tokens"
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { NextPageParams } from "~/app/typings";
import { rscLocaleFromParams } from "~/lib/api/rsc-fetchers";
import { routes } from "~/lib/routes";

const clientTokens = [...tokensLoginDialog]

const Login = async ({
  params,
  searchParams,
}: NextPageParams<{ lang: string }, { from: string }>
) => {
  const user = await rscCurrentUser();
  const { locale, error } = await rscLocaleFromParams(params)
  if (error) return <div>Can't load translations</div>
  const clientSideLocale = filterClientSideStrings<{}>(locale, clientTokens, {}, { pageName: "account_login" })

  return (
    <div className="contents-narrow">
      <I18nContextProvider locale={clientSideLocale}>
        <LoginDialog
          user={user}
          successRedirectionPath={
            searchParams.from ||
            // since we are on the login page, redirect to home on succes
            routes.home.href
          }
        />
      </I18nContextProvider>
    </div>
  );
};

export default Login;
