import { useUser } from "~/account/user/hooks";
import { PageLayout } from "~/core/components/layout";
import ChangePasswordForm from "~/account/passwordLogin/components/ChangePassword";
import { routes } from "~/lib/routes";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import UserResponses from "~/core/components/users/UserResponses";

const Profile = () => {
  const Components = useVulcanComponents();
  const { user } = useUser({ redirectTo: routes.account.login.href });
  if (!user) return null; // will redirect
  return (
    <PageLayout>
      <div className="contents-narrow account">
        <p>
          {user.authMode === "anonymous" && (
            <Components.FormattedMessage id="accounts.logged_in_as_guest" />
          )}
        </p>
        {/* {
          // Legacy password mode
          (!user.authMode || user.authMode === "password") && (
            <ChangePasswordForm user={user} />
          )
        } */}
        <UserResponses user={user} />
        <p>
          <Components.FormattedMessage id="accounts.questions" html={true} />
        </p>
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
