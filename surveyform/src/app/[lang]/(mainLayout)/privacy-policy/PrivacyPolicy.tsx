import { DynamicT } from "@devographics/react-i18n";

const PrivacyPolicy = () => (
  <div className="contents-narrow privacy-policy">
    <h2>
      <DynamicT token="general.privacy_policy" />
    </h2>
    <DynamicT token="general.privacy_policy.description" />
  </div>
);

export default PrivacyPolicy;
