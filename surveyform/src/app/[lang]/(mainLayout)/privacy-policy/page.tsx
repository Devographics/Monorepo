import PrivacyPolicy from "./PrivacyPolicy";

import { locales } from "~/i18n/data/locales";
export function generateStaticParams() {
  return locales.map((l) => ({ lang: l }));
}

const PrivacyPolicyPage = () => {
  return <PrivacyPolicy />;
};

export default PrivacyPolicyPage;
