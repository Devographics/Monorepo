import { LoginDialog } from "~/account/LoginDialog";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { NextPageParams } from "~/app/typings";
import { routes } from "~/lib/routes";

const Login = async ({
  params,
  searchParams,
}: NextPageParams<{ lang: string }, { from: string }>
) => {
  const user = await rscCurrentUser();

  return (
    <div className="contents-narrow">
      <LoginDialog
        user={user}
        successRedirectionPath={
          searchParams.from ||
          // since we are on the login page, redirect to home on succes
          routes.home.href
        }
      />
    </div>
  );
};

export default Login;
