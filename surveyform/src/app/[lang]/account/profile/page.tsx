"use client";
import { useUser } from "~/account/user/hooks";
import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import UserResponses from "~/core/components/users/UserResponses";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

const Profile = () => {
  const { user } = useUser({ redirectTo: routes.account.login.href });
  if (!user) return null; // will redirect
  return (
    <div className="contents-narrow account">
      <p>
        {user.authMode === "anonymous" && (
          <FormattedMessage id="accounts.logged_in_as_guest" />
        )}
      </p>
      <UserResponses />
      <p>
        <FormattedMessage id="accounts.questions" />
      </p>
      <p>
        <LogoutButton />
      </p>
    </div>
  );
};

export default Profile;
