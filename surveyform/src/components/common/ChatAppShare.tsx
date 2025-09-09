"use client";

import { EditionMetadata } from "@devographics/types";
import { Button } from "../ui/Button";
import s from "./ChatAppShare.module.scss";
import { useState } from "react";
import { T, useI18n } from "@devographics/react-i18n";

const ChatAppShare = ({ edition }: { edition: EditionMetadata }) => {
  const { getMessage } = useI18n();
  const [copied, setCopied] = useState(false);
  const { questionsUrl } = edition;

  const link = `${questionsUrl}?source=post_survey_share_chat`;

  const shareContent = getMessage(`finish.share_message.${edition.id}`, {
    link,
  })?.t;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset "copied" state after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={s.chat_app_share}>
      <h4 className={s.chat_app_share_heading}>
        <T token="finish.share_colleagues" />
      </h4>
      <p>
        <T token="finish.share_colleagues.description" />
      </p>
      <div className={s.chat_app_share_contents}>
        <textarea className="form-control" defaultValue={shareContent} />
        <Button onClick={handleCopyToClipboard}>
          {copied ? <T token="finish.copied" /> : <T token="finish.copy" />}
        </Button>
      </div>
    </div>
  );
};

export default ChatAppShare;
