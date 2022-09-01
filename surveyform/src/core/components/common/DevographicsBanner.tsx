import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useCookies } from "react-cookie";
import { useMounted } from "~/core/hooks/useMounted";

const DevographicsBanner = () => {
  const Components = useVulcanComponents();
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
          <Components.FormattedMessage
            id="general.devographics_banner"
            html={true}
          />
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
