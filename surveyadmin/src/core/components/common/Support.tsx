import { useVulcanComponents } from "@vulcanjs/react-ui";
import React from "react";

const Support = () => {
  const Components = useVulcanComponents();
  return (
    <div className="support survey-page-block">
      <h3 className="support-heading survey-page-block-heading">
        <Components.FormattedMessage id="general.support_from" />
      </h3>
      <div className="support-item">
        <a href="https://google.com">
          <img src="/images/google.png" alt="Google" />
        </a>
      </div>
      {/*
      <div className="support-item">
        <a href="https://makeitfable.com/">
          <img src="/images/fable.png" alt="Fable" />
        </a>
      </div>
       */}
    </div>
  );
};

export default Support;
