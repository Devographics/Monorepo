"use client";
import React from "react";
import { useCookies } from "react-cookie";
import { T } from "@devographics/react-i18n"
import { useClient } from "./useClient";



const DevographicsBanner = () => {
  const [cookies, setCookie] = useCookies(["hideDevographicsBanner"]);
  const mounted = useClient()
  const hideBanner = !mounted || cookies.hideDevographicsBanner;

  const handleClose = () => {
    setCookie("hideDevographicsBanner", true, { path: "/" });
  };

  return hideBanner ? null : (
    <div className="devographics-banner">
      <div className="devographics-banner-inner">
        <div className="devographics-banner-message">
          <T token="general.devographics_banner" />
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
