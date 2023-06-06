"use client";
import React from "react";
import LocaleSwitcher from "./LocaleSwitcher";
import Link from "next/link";
import { routes } from "~/lib/routes";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { EditionMetadata } from "@devographics/types";
import { getEditionHomePath } from "~/lib/surveys/helpers";
import { useLocaleContext } from "~/i18n/context/LocaleContext";

const Navigation = ({ edition }: { edition: EditionMetadata }) => {
  const { locale } = useLocaleContext();
  return (
    <div className="nav-wrapper">
      <div className="nav-surveys">
        <Link className="nav-surveys-link" href={routes.home.href}>
          <FormattedMessage id="nav.surveys" />
        </Link>
        {edition && (
          <>
            {" "}
            <span>/</span>{" "}
            <Link
              className="nav-surveys-link"
              href={getEditionHomePath({ edition, locale })}
            >
              {edition.survey.name} {edition.year}
            </Link>
          </>
        )}
      </div>

      <div className="nav-item-locale">
        <LocaleSwitcher />
      </div>
    </div>
  );
};

export default Navigation;
