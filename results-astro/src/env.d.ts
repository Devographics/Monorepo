/// <reference types="astro/client" />

import type { EditionMetadata } from "@devographics/types";
import type { Theme } from "./lib/theme";
import type { PageDefinition, Sitemap } from "./lib/sitemap";

declare namespace App {
    // Defines Astro.locals valid value
    // these value must be set in a page or middleware
    interface Locals {
        survey: EditionMetadata,
        sitemap: Sitemap
        pageDefinition: PageDefinition
        theme: Theme,
    }
}