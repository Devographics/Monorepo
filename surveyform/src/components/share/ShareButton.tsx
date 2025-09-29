import s from "./ShareButton.module.scss";
import React from "react";
import { useI18n } from "@devographics/react-i18n";
import {
  BlueskyIcon,
  TwitterIcon,
  MastodonIcon,
  FacebookIcon,
  LinkedInIcon,
  EmailIcon,
} from "@devographics/icons";

const icons = {
  bluesky: BlueskyIcon,
  twitter: TwitterIcon,
  mastodon: MastodonIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
  email: EmailIcon,
};

const ShareButton = ({ id, href }: { id: string; href: string }) => {
  const { t } = useI18n();
  const Icon = icons[id];
  const label = t(`share.${id}`);
  return (
    <a
      // onClick={track('Twitter', trackingId)}
      className={s.share_button}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      <div aria-hidden="true" className={`${s.share_button_inner}`}>
        <Icon />
      </div>
      <span className="sr-only">{label}</span>
    </a>
  );
};

export default ShareButton;
