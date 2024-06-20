import { ServerT } from "~/i18n/components/ServerT";

const PrivacyPolicy = () => (
  <div className="contents-narrow privacy-policy">
    <h2>
      <ServerT token="general.privacy_policy" />
    </h2>
    <ServerT token="general.privacy_policy.description" />
  </div>
);

export default PrivacyPolicy;
