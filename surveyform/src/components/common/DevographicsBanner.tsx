"use client";
import React from "react";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { teapot } from "@devographics/react-i18n";

export const { T, tokens } = teapot(["general.devographics_banner"] as const)
/**
 *
 * @returns true on the second client-render, when hydratation is done
 * false on server  and first client-render (for hydratation)
 */
export const useMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
};

const DevographicsBanner = () => {
  const [cookies, setCookie] = useCookies(["hideDevographicsBanner"]);
  const mounted = useMounted();
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
