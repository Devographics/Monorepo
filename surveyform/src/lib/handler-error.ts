import { NextRequest, NextResponse } from "next/server";
import { getClosestLocale } from "~/lib/i18n/data/locales";
import { getLocaleFromAcceptLanguage } from "~/lib/i18n/server/localeDetection";
import { DetailedErrorObject } from "./validation";
// import { captureException } from "@sentry/nextjs";

interface HandlerErrorObjectParams extends DetailedErrorObject {
  status?: number;
}
export interface HandlerErrorObject extends DetailedErrorObject {
  status: number;
}

function handlerLocaleId(request: NextRequest, langFromPath?: string) {
  /**
   * NOTE: we have similar code in route handlers that produce localized responses
   * Priorities:
   * 1. lang already in URL => to be passed from the route handler if available
   * 2. accept-language header
   * 3. en-US/default locale
   *
   * User can change locale cookie via the locale selector menu
   */
  const locale =
    langFromPath ||
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
  constructor(props: HandlerErrorObjectParams) {
    super(props.message);
    console.error("// HandlerError");
    console.error(props);
    this.id = props.id;
    this.status = props.status || 500;
    this.properties = props.properties;
    this.error = props.error;
  }

  async toNextResponse(request: NextRequest) {
    // TODO: extract the current locale from request and translate the error message
    // TODO: get the translations from there
    // context is important to get the minimum necessary data
    // we might want to add a timemout and return the default message if this request is too slow
    /// const localeId = handlerLocaleId(request)

    // TODO: then apply the translation: factor code from surveyform/src/app/[lang]/(mainLayout)/layout.tsx
    // that creates a StringsRegistry sever side

    const { id, status, properties, message, error: initialError } = this;
    const error = {
      id,
      status,
      properties,
      message,
      error: initialError,
    };
    // captureException(error);
    return NextResponse.json(
      {
        error,
      },
      { status: this.status },
    );
  }
}
