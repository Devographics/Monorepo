import { routes } from "~/lib/routes";
import { LogoutButton } from "~/components/users/LogoutButton";
import UserResponses from "~/components/users/UserResponses";
import { redirect } from "next/navigation";
import { getRawResponsesCollection } from "@devographics/mongo";
import { type UserDocument } from "~/lib/users/typings";
import { cache } from "react";
import { type ResponseDocument } from "@devographics/types";
import { rscCurrentUser } from "~/lib/users/rsc-fetchers/rscCurrentUser";
import { rscFetchSurveysMetadata } from "~/lib/surveys/rsc-fetchers";
import { StandaloneMagicLoginForm } from "~/lib/account/magicLogin/components/StandaloneMagicLoginForm";
import { DynamicT } from "@devographics/react-i18n";

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

const Profile = async props => {
  const params = await props.params;
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
              <DynamicT token="accounts.logged_in_as_guest" />
            </strong>
            <p>
              <DynamicT token="accounts.upgrade_account.description" />
            </p>
            <StandaloneMagicLoginForm
              label={<DynamicT token="accounts.upgrade_account.action" />}
            />
          </div>
        ) : (
          <div className="mb-5">
            <strong>
              <DynamicT
                token="accounts.logged_in_as"
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
        <DynamicT token="accounts.questions" />
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
