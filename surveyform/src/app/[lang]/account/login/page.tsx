import { LoginDialog } from "~/account/LoginDialog";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";

const Login = async () => {
  const user = await rscCurrentUser();
  // @ts-ignore
  return <LoginDialog user={user} />;
};

export default Login;
