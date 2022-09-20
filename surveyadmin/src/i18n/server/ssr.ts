import { GetServerSideProps, GetStaticProps } from "next";
import { getLocaleStrings } from "./fetchLocales";

const LOCALE_STRINGS_TTL_SECONDS = 20 * 60;
export const getLocaleStaticProps: GetStaticProps = async ({ locale }) => {
  if (!locale) {
    return {
      props: { locale: "en-US" },
      revalidate: LOCALE_STRINGS_TTL_SECONDS,
    };
  }
  try {
    // TODO: if the locale id is not known (eg try zz-ZZ)
    // we should try to fetch english instead
    const localeWithStrings = await getLocaleStrings(locale /*, origin*/);
    // NOTE: do not return null or undefined for such props, instead they should not appear at all
    // in the props object otherwise it will mess next js serialization
    if (localeWithStrings?.strings) {
      return {
        props: {
          // Important: the locale retrieved by getLocaleStrings might be different from the requested locale
          // eg fr => fr-FR
          locale: localeWithStrings.id,
          localeStrings: localeWithStrings.strings,
        },
        // ISR, will avoid a long build time
        // @see https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
        revalidate: LOCALE_STRINGS_TTL_SECONDS,
      };
    } else {
      return {
        props: {
          locale,
          // Failure, retry in 30 seconds
        },
        revalidate: 30,
      };
    }
  } catch (err) {
    console.warn("Could not get locale strings during ssg", locale, err);
    return {
      props: {
        locale,
      },
      revalidate: 30, // in seconds, we revalidate often in case of locale miss
    };
  }
};

export const getLocaleServerSideProps: GetServerSideProps = async ({
  locale,
}) => {
  if (!locale) {
    return { props: { locale: "en" } };
  }
  try {
    // TODO: if the locale id is not known (eg try zz-ZZ)
    // we should try to fetch english instead
    const localeWithStrings = await getLocaleStrings(locale /*, origin*/);
    // NOTE: never return undefined props for data fetching methods, it breaks serialization
    // instead first check the value and then only return only defined props
    if (!localeWithStrings?.strings) {
      return {
        props: {
          locale,
        },
      };
    } else {
      return {
        props: {
          locale,
          localeStrings: localeWithStrings.strings,
        },
      };
    }
  } catch (err) {
    console.warn("Could not get locale strings during SSR", locale, err);
    return {
      props: {
        locale,
      },
    };
  }
};

/** Will render only the en version, and render any other path in blocking mode with ISR */
export const localeDefaultStaticPaths = {
  // prerender en version
  paths: [{ params: {}, locale: "en" }],
  fallback: "blocking", // true, // false or 'blocking'
};
