import type { PageDefinition } from "./sitemap"
// TODO: get pages from the sitemap
export const getPageLabelKey = (pageContext: PageDefinition): string =>
    pageContext.titleId || `sections.${pageContext.intlId || pageContext.id}.title`