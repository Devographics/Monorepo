import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import UserResponses from "~/core/components/users/UserResponses";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { redirect } from "next/navigation";
import { getCurrentUser } from "~/account/user/api/rsc-fetchers";
import { getRawResponsesCollection } from "@devographics/mongo";
import { UserDocument } from "~/core/models/user";
import { cache } from "react";
import { ResponseDocument } from "@devographics/core-models";

const getResponses = cache(
  async ({ currentUser }: { currentUser: UserDocument }) => {
    const RawResponse = await getRawResponsesCollection<ResponseDocument>();
    const responsesFromDb = await RawResponse.find({
      userId: currentUser,
    }).toArray();
    // just a defensive permission check
    responsesFromDb.forEach((r) => {
      if (r.userId !== currentUser._id) {
        throw new Error("Got response whose userId doesn't match current user");
      }
    });
    // TODO: restrict fields, double check that the document
    const responses = responsesFromDb as Array<ResponseDocument>;
    return [];
    //return responses;
  }
);

const Profile = async () => {
  // TODO: filter out fields the user is not supposed to see
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    // TODO: use from, require to get current request URL
    return redirect(routes.account.login.href);
  }
  const responses = await getResponses({ currentUser });
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
