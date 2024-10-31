"use client";

import { T } from "@devographics/react-i18n";

export const TokyoDev = () => {
  return process.env.NEXT_PUBLIC_CONFIG === "tokyodev" ? (
    <section className="tokyodev-info">
      <div className="tokyodev-info-inner">
        <div className="tokyodev-info-founder">
          <img src="https://assets.surveys.tokyodev.com/images/avatars/paul_mcmahon.jpg" />
          <h5>
            <T token="tokyodev.founder" />
          </h5>
        </div>
        <div className="tokyodev-info-contents">
          <h3>
            <T token="tokyodev.about" />
          </h3>
          <div>
            <T token="tokyodev.description" />
          </div>
          <p>
            <a href="https://www.tokyodev.com/about">
              <T token="tokyodev.learn_more" />
            </a>
          </p>
        </div>
      </div>
    </section>
  ) : null;
};

export default TokyoDev;
