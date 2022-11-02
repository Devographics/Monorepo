import React from "react";
import { useCookies } from "react-cookie";
import { useMounted } from "~/core/hooks/useMounted";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

const DevographicsBanner = () => {
  const [cookies, setCookie] = useCookies(["hideDevographicsBanner"]);
  const mounted = useMounted();
  const hideBanner = !mounted || cookies.hideDevographicsBanner;

  const handleClose = () => {
    setCookie("hideDevographicsBanner", true);
  };

  return hideBanner ? null : (
    <div className="devographics-banner">
      <div className="devographics-banner-inner">
        <div className="devographics-banner-message">
          <FormattedMessage id="general.devographics_banner" />
        </div>
      </div>
      <div className="devographics-banner-close" onClick={handleClose}>
        <div className="devographics-banner-close-inner">
          <span className="visually-hidden">Close</span>
          <span aria-hidden="true">✖</span>
        </div>
      </div>
    </div>
  );
};

export default DevographicsBanner;
