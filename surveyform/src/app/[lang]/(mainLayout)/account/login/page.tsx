import { rscCurrentUser } from "~/lib/users/rsc-fetchers/rscCurrentUser";
import { NextPageParams } from "~/app/typings";
import { routes } from "~/lib/routes";
import { LoginDialog } from "~/components/users/LoginDialog";

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
