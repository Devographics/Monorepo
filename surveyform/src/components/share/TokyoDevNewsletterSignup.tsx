"use client";
import { useEffect, useRef, useState } from "react";
import { T } from "@devographics/react-i18n";

const TokyoDevNewsletterSignup = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const newHeight = event.data?.tokyodevMailingListWidgetHeight;
      if (newHeight) setHeight(newHeight);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="tokyodev-newsletter">
      {/* <h4>
        <T token="finish.tokyodev_newsletter.heading" />
      </h4>
      <div className="tokyodev-newsletter-content">
        <T token="finish.tokyodev_newsletter.description" />
      </div> */}
      <iframe
        ref={iframeRef}
        src="https://www.tokyodev.com/survey_newsletter"
        title="Subscribe to the TokyoDev newsletter"
        loading="lazy"
        scrolling="no"
        style={{ display: "block", width: "100%", border: 0, height }}
      />
    </div>
  );
};

export default TokyoDevNewsletterSignup;
