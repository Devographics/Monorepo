import { FormattedMessage } from "~/components/common/FormattedMessage";

const PrivacyPolicy = () => (
  <div className="contents-narrow privacy-policy">
    <h2>
      <FormattedMessage id="general.privacy_policy" />
    </h2>
    <FormattedMessage id="general.privacy_policy.description" />
  </div>
);

export default PrivacyPolicy;
