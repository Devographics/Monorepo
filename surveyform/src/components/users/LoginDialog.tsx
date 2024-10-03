import { AnonymousLoginForm } from "~/lib/account/anonymousLogin/components/AnonymousLogin";
import {
  StandaloneMagicLoginForm,
  StandaloneMagicLoginFormProps,
} from "~/lib/account/magicLogin/components/StandaloneMagicLoginForm";
import { type UserDocument } from "~/lib/users/typings";
import { type ResponseDocument } from "@devographics/types";
import { T } from "@devographics/react-i18n"

export const LoginDialog = ({
  hideGuest,
  user,
  surveyId,
  editionId,
  successRedirectionPath,
  successRedirectionFunction,
  loginOptions,
}: {
  hideGuest?: boolean;
  user?: UserDocument | null;
  /**
   * Redirect after succesful auth
   */
  successRedirectionPath?: string;
  successRedirectionFunction?: (res: ResponseDocument) => string;
  loginOptions?: { data?: any; createResponse?: boolean };
} & Pick<StandaloneMagicLoginFormProps, "surveyId" | "editionId">) => {
  //const redirectedFrom = router.query?.from as string;
  return user ? (
    <div>You are already logged in.</div>
  ) : (
    <div className="survey-login-options">
      <div className="survey-login-option">
        <h4>
          <T token="accounts.create_account" />
        </h4>
        <div className="survey-login-option-description">
          <T token="accounts.create_account.description" />
        </div>
        <div className="survey-login-action">
          <StandaloneMagicLoginForm
            surveyId={surveyId}
            editionId={editionId}
            label={<T token="accounts.create_account.action" />}
            redirectTo={successRedirectionPath}
          // loginOptions={loginOptions}
          />
        </div>
        <div className="survey-login-option-note">
          <T token="accounts.create_account.note" />
        </div>
      </div>
      {!hideGuest && (
        <div className="survey-login-option">
          <h4>
            <T token="accounts.continue_as_guest" />
          </h4>
          <div className="survey-login-option-description">
            <T token="accounts.continue_as_guest.description" />
          </div>
          <div className="survey-login-action">
            <AnonymousLoginForm
              label={
                <T token="accounts.continue_as_guest.action" />
              }
              successRedirectionFunction={successRedirectionFunction}
              successRedirectionPath={successRedirectionPath}
              loginOptions={loginOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
};
