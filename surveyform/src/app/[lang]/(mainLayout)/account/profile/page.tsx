import { routes } from "~/lib/routes";
import { LogoutButton } from "~/account/user/components/LogoutButton";
import UserResponses from "~/components/users/UserResponses";
import { redirect } from "next/navigation";
import { getRawResponsesCollection } from "@devographics/mongo";
import { UserDocument } from "~/account/user/typings";
import { cache } from "react";
import { type ResponseDocument } from "@devographics/types";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { rscFetchSurveysMetadata } from "~/lib/surveys/rsc-fetchers";
import { StandaloneMagicLoginForm } from "~/account/magicLogin/components/StandaloneMagicLoginForm";
import { setLocaleIdServerContext } from "~/i18n/rsc-context";
import { ServerT } from "~/i18n/components/ServerT";

const getResponses = cache(
  async ({ currentUser }: { currentUser: UserDocument }) => {
    const RawResponses = await getRawResponsesCollection();
    const responsesFromDb = await RawResponses.find(
      {
        userId: currentUser._id,
      },
      { sort: { createdAt: -1 } }
    ).toArray();
    const responses = responsesFromDb as Array<ResponseDocument>;
    return responses;
  }
);

const Profile = async ({ params }) => {
  setLocaleIdServerContext(params.lang) // Needed for "ServerT"
  const { data: surveys } = await rscFetchSurveysMetadata({
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
        {currentUser.authMode === "anonymous" ? (
          <div className="mb-5">
            <strong>
              <ServerT token="accounts.logged_in_as_guest" />
            </strong>
            <p>
              <ServerT token="accounts.upgrade_account.description" />
            </p>
            <StandaloneMagicLoginForm
              label={<ServerT token="accounts.upgrade_account.action" />}
            />
          </div>
        ) : (
          <div className="mb-5">
            <strong>
              <ServerT token="accounts.logged_in_as"
                // TODO: older translations expect an "email" parameter
                // but we one-way encrypt email so we don't know them anymore
                // only en-US translation is up to date (09/2023)
                values={{ email: "Email user" }}
              />
            </strong>
          </div>
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
        <ServerT token="accounts.questions" />
      </p>
      <p>
        <LogoutButton />
      </p>
      <p className="account-userId">
        ID: <code>{currentUser._id}</code>
      </p>
    </div>
  );
};

export default Profile;
