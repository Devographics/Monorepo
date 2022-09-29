import { useUser } from "~/account/user/hooks";
import { PageLayout } from "~/core/components/layout";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import UserResponses from "~/core/components/users/UserResponses";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

const Profile = () => {
  const { user } = useUser({ redirectTo: routes.account.login.href });
  if (!user) return null; // will redirect
  return (
    <PageLayout>
      <div className="contents-narrow account">
        <p>
          {user.authMode === "anonymous" && (
            <FormattedMessage id="accounts.logged_in_as_guest" />
          )}
        </p>
        <UserResponses user={user} />
        <p>
          <FormattedMessage id="accounts.questions" html={true} />
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
