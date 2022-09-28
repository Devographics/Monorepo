import { useRouter } from "next/router.js";
import { AnonymousLoginForm } from "~/account/anonymousLogin/components/AnonymousLogin";
//import { isAnonymousAuthEnabled } from "~/account/anonymousLogin/lib";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useUser } from "~/account/user/hooks";
import { DynamicReactMarkdown } from "~/core/components/markdown/DynamicReactMarkdown";
import rehypeRaw from "rehype-raw";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { StandaloneMagicLoginForm } from "~/account/magicLogin/components/StandaloneMagicLoginForm";

const LoginOptions = () => {
  const Components = useVulcanComponents();
  const intl = useIntlContext();

  const { user } = useUser({ redirectTo: "/", redirectIfFound: true });
  const router = useRouter();
  //const redirectedFrom = router.query?.from as string;
  return user ? (
    <div>You are already logged in.</div>
  ) : (
    <div className="survey-login-options">
      <div className="survey-login-option">
        <h4>
          <Components.FormattedMessage id="accounts.create_account" />
        </h4>
        <div className="survey-login-option-description">
          <DynamicReactMarkdown rehypePlugins={[rehypeRaw]}>
            {intl.formatMessage({
              id: `accounts.create_account.description`,
            })}
          </DynamicReactMarkdown>
        </div>
        <div className="survey-login-action">
          <StandaloneMagicLoginForm
            label={
              <Components.FormattedMessage id="accounts.create_account.action" />
            }
          />
        </div>
        <div className="survey-login-option-note">
          <DynamicReactMarkdown rehypePlugins={[rehypeRaw]}>
            {intl.formatMessage({ id: `accounts.create_account.note` })}
          </DynamicReactMarkdown>
        </div>
      </div>
      <div className="survey-login-option">
        <h4>
          <Components.FormattedMessage id="accounts.continue_as_guest" />
        </h4>
        <div className="survey-login-option-description">
          <DynamicReactMarkdown rehypePlugins={[rehypeRaw]}>
            {intl.formatMessage({
              id: `accounts.continue_as_guest.description`,
            })}
          </DynamicReactMarkdown>
        </div>
        <div className="survey-login-action">
          <AnonymousLoginForm
            label={
              <Components.FormattedMessage id="accounts.continue_as_guest.action" />
            }
          />
        </div>
      </div>
      {/* 
        <Components.AccountsLoginForm
          redirect={false}
          formState={STATES.SIGN_UP}
          email={email}
        />
        */}
      {/* <AccountMessage /> */}
    </div>
  );
};

export default LoginOptions;
