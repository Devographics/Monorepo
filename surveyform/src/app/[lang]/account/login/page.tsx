import { LoginDialog } from "~/account/LoginDialog";
import { getCurrentUser } from "../../survey/[slug]/[year]/[responseId]/fetchers";

const Login = async () => {
  const user = await getCurrentUser();
  // @ts-ignore
  return <LoginDialog user={user} />;
};

export default Login;
