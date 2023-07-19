import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import UserResponses from "~/components/users/UserResponses";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { redirect } from "next/navigation";
import { getRawResponsesCollection } from "@devographics/mongo";
import { UserDocument } from "~/account/user/typings";
import { cache } from "react";
import { AppName, type ResponseDocument } from "@devographics/types";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";

const getResponses = cache(
  async ({ currentUser }: { currentUser: UserDocument }) => {
    const RawResponses = await getRawResponsesCollection<ResponseDocument>();
    const responsesFromDb = await RawResponses.find({
      userId: currentUser._id,
    }).toArray();
    const responses = responsesFromDb as Array<ResponseDocument>;
    return responses;
  }
);

const Profile = async ({ params }) => {
  const { data: surveys } = await fetchSurveysMetadata({
    calledFrom: "UserResponses",
  });

  // TODO: filter out fields the user is not supposed to see
  const currentUser = await rscCurrentUser();
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
      {responses?.length > 0 && currentUser.authMode !== "anonymous" && (
        <UserResponses
          surveys={surveys}
          localeId={params.lang}
          responses={responses}
          user={currentUser}
        />
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
