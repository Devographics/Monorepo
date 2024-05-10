/// <reference types="astro/client" />

// Direct imports doesn't work in definition files
// (it would turn the global "ambiant" type into a local module that you need to import explicitly everywhere it's used)
// Instead we need some kind of dynamic imports aka import types
// @see https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts
// @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-9.html#import-types
// import type { EditionMetadata } from "@devographics/types";
// import type { PageDefinition, Sitemap } from "./lib/sitemap";

declare namespace App {
    // Defines Astro.locals valid value
    // these value must be set in a page or middleware
    interface Locals {
        edition: import("@devographics/types").EditionMetadata
        sitemap: import("./lib/sitemap").Sitemap
        pageDefinition: import("./lib/sitemap").PageDefinition
        pageData: any,
        theme: import("./lib/theme").Theme,
        i18n: {
            t: import("@devographics/i18n").StringTranslator,
            locale: { id: string },
            localizePath: (path: string) => string
        }
    }
}