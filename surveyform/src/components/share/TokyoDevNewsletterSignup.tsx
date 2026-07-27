"use client";
import { T } from "@devographics/react-i18n";

const TokyoDevNewsletterSignup = () => {
  return (
    <div className="tokyodev-newsletter">
      <h4>
        <T token="finish.tokyodev_newsletter.heading" />
      </h4>
      <div className="tokyodev-newsletter-content">
        <T token="finish.tokyodev_newsletter.description" />
      </div>
    </div>
  );
};

export default TokyoDevNewsletterSignup;
