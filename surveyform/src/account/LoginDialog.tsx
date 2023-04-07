import { AnonymousLoginForm } from "~/account/anonymousLogin/components/AnonymousLogin";
import { StandaloneMagicLoginForm } from "~/account/magicLogin/components/StandaloneMagicLoginForm";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { UserDocument } from "~/core/models/user";

export const LoginDialog = ({
  hideGuest,
  user,
}: {
  hideGuest?: boolean;
  user?: UserDocument | null;
}) => {
  //const redirectedFrom = router.query?.from as string;
  return user ? (
    <div>You are already logged in.</div>
  ) : (
    <div className="survey-login-options">
      <div className="survey-login-option">
        <h4>
          <FormattedMessage id="accounts.create_account" />
        </h4>
        <div className="survey-login-option-description">
          <FormattedMessage id="accounts.create_account.description" />
        </div>
        <div className="survey-login-action">
          <StandaloneMagicLoginForm
            label={<FormattedMessage id="accounts.create_account.action" />}
          />
        </div>
        <div className="survey-login-option-note">
          <FormattedMessage id="accounts.create_account.note" />
        </div>
      </div>
      {!hideGuest && (
        <div className="survey-login-option">
          <h4>
            <FormattedMessage id="accounts.continue_as_guest" />
          </h4>
          <div className="survey-login-option-description">
            <FormattedMessage id="accounts.continue_as_guest.description" />
          </div>
          <div className="survey-login-action">
            <AnonymousLoginForm
              label={
                <FormattedMessage id="accounts.continue_as_guest.action" />
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
