import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import UserResponses from "~/core/components/users/UserResponses";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { redirect } from "next/navigation";
import { getCurrentUser } from "~/account/user/api/rsc-fetchers";

const Profile = async () => {
  // TODO: filter out fields the user is not supposed to see
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    // TODO: use from, require to get current request URL
    return redirect(routes.account.login.href);
  }
  // TODO: get responses from DB
  const responses = [];
  return (
    <div className="contents-narrow account">
      <p>
        {currentUser.authMode === "anonymous" && (
          <FormattedMessage id="accounts.logged_in_as_guest" />
        )}
      </p>
      {currentUser.authMode !== "anonymous" && (
        <UserResponses responses={responses} user={currentUser} />
      )}
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
