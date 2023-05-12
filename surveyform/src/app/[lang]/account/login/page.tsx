import { LoginDialog } from "~/account/LoginDialog";
import { getCurrentUser } from "~/account/user/api/fetchers";

const Login = async () => {
  const user = await getCurrentUser();
  // @ts-ignore
  return <LoginDialog user={user} />;
};

export default Login;
