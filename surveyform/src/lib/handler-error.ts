import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE_NAME } from "~/i18n/cookie";
import { getClosestLocale } from "~/i18n/data/locales";
// import { fetchLocaleStrings } from "~/i18n/db-actions/fetchLocales";
import { getLocaleFromAcceptLanguage } from "~/i18n/server/localeDetection";
import { DetailedErrorObject } from "./validation";

export interface HandlerErrorObject extends DetailedErrorObject {
  status: number;
}

function handlerLocaleId(request: NextRequest) {
  /**
   * NOTE: we have similar code in route handlers that produce localized responses
   * Priorities:
   * 1. locale cookie
   * (2. lang already in URL) => this is only for web pages, not API calls
   * 3. accept-language header
   *
   * User can change locale cookie via the locale selector menu
   */
  const locale =
    request.cookies.get(LOCALE_COOKIE_NAME)?.value ||
    //langFromPath ||
    getLocaleFromAcceptLanguage(request.headers.get("accept-language")) ||
    "en-US";
  const validLocale = getClosestLocale(locale);
  console.log("// handler-error locale");
  console.log({ locale, validLocale });
}

export class HandlerError extends Error {
  id: string;
  status: number;
  properties?: string;
  error?: any;
  constructor(props: HandlerErrorObject) {
    super(props.message);
    console.error("// HandlerError");
    console.error(props);
    this.id = props.id;
    this.status = props.status;
    this.properties = props.properties;
    this.error = props.error;
  }

  async toNextResponse(request: NextRequest) {
    // TODO: extract the current locale from request and translate the error message
    // TODO: get the translations from there
    // context is important to get the minimum necessary data
    // we might want to add a timemout and return the default message if this request is too slow
    /// const localeId = handlerLocaleId(request)
    // await fetchLocaleStrings({ localeId: validLocale, contexts: ["errors"] })

    // TODO: then apply the translation: factor code from surveyform/src/app/[lang]/layout.tsx
    // that creates a StringsRegistry sever side

    const { id, status, properties, message, error } = this;
    return NextResponse.json(
      {
        error: {
          id,
          status,
          properties,
          message,
          error,
        },
      },
      { status: this.status }
    );
  }
}
