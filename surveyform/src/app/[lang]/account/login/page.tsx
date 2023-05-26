import { LoginDialog } from "~/account/LoginDialog";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";

const Login = async ({
  searchParams,
}: {
  searchParams: {
    /** Redirect back to this page on success */
    from: string;
  };
}) => {
  const user = await rscCurrentUser();
  return (
    <div className="contents-narrow">
      <LoginDialog user={user} successRedirectionPath={searchParams.from} />
    </div>
  );
};

export default Login;
