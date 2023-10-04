"use client";
import { FormattedMessage } from "~/components/common/FormattedMessage";

export const TokyoDev = () => {
  return process.env.NEXT_PUBLIC_CONFIG === "tokyodev" ? (
    <section className="tokyodev-info">
      <div className="tokyodev-info-inner">
        <div className="tokyodev-info-founder">
          <img src="https://www.tokyodev.com/assets/paul-4a180dffafbb67b795ebac5b1a08f58fc937705f015d9fd6197f7237416dc4f6.jpg" />
          <h5>
            <FormattedMessage id="tokyodev.founder" />
          </h5>
        </div>
        <div className="tokyodev-info-contents">
          <h3>
            <FormattedMessage id="tokyodev.about" />
          </h3>
          <div>
            <FormattedMessage id="tokyodev.description" />
          </div>
          <p>
            <a href="https://www.tokyodev.com/about">
              <FormattedMessage id="tokyodev.learn_more" />
            </a>
          </p>
        </div>
      </div>
    </section>
  ) : null;
};

export default TokyoDev;
