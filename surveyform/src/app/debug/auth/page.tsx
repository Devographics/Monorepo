import { AnonymousLoginForm } from "~/account/anonymousLogin/components/AnonymousLogin";
import { StandaloneMagicLoginForm } from "~/account/magicLogin/components/StandaloneMagicLoginForm";
const AuthDebugPage = () => {
  return (
    <div>
      <StandaloneMagicLoginForm />
      <p>
        Note: if you login anonymously, you can still "upgrade" to a user with
        email, using the standalone magic login form
      </p>
      <AnonymousLoginForm successRedirection="/debug/auth" />
    </div>
  );
};

export default AuthDebugPage;
