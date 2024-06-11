import { AnonymousLoginForm } from "~/account/anonymousLogin/components/AnonymousLogin";
import {
  StandaloneMagicLoginForm,
  StandaloneMagicLoginFormProps,
} from "~/account/magicLogin/components/StandaloneMagicLoginForm";
import { UserDocument } from "~/account/user/typings";
import { ResponseDocument } from "@devographics/types";
import { teapot } from "@devographics/react-i18n";
import { tokens } from "./LoginDialog.tokens";

const { T } = teapot(tokens)
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
