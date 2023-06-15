import { useUser } from "~/account/user/hooks";
import { PageLayout } from "~/core/components/layout";
import ChangePasswordForm from "~/account/passwordLogin/components/ChangePassword";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";

const Profile = () => {
  const { user } = useUser({ redirectTo: routes.account.login.href });
  if (!user) return null; // will redirect
  return (
    <PageLayout>
      <div className="contents-narrow account">
        {
          // Legacy password mode
          (!user.authMode || user.authMode === "password") && (
            <ChangePasswordForm user={user} />
          )
        }
        <p>
          <LogoutButton />
        </p>
      </div>
    </PageLayout>
  );
};

import { getLocaleStaticProps } from "~/i18n/server/ssr";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default Profile;
