import { json, useLoaderData, useParams } from "@remix-run/react"

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

import { loaderSurveyWithSitemap } from "~/fetchers/surveyWithSitemap";
import { LayoutWrapper } from "~/core/layout/LayoutWrapper";
import { any } from "prop-types";

export const meta: MetaFunction = () => {
    return [
        { title: "New Remix App" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

// TODO: survey could be obtained at an higher level and provided to the loader context
// But this may have a low impact given that we only have one real page
// https://remix.run/docs/en/main/route/loader#context
export async function loader({ params }: LoaderFunctionArgs) {
    // TODO: load language, here or in layout?
    // Equivalent in Astro: results-astro/src/pages/[locale]/[...path].astro
    // Equivalent in Gatsby: node_src page creation
    const surveyWithSitemap = await loaderSurveyWithSitemap()
    // = the rest parameter
    const pagePath = params["*"]
    const pageDefinition = surveyWithSitemap.sitemap.find(page => page.path === pagePath)
    if (!pageDefinition) {
        // TODO: actual 404
        throw new Error(`Page not found for param ${pagePath}`)
    }
    // Survey with sitemap can't have circular references because of the serialization
    // TODO: pageContext is more than current page definition, see Astro env.d.ts for Astro.locals
    return json({ surveyWithSitemap, pageDefinition })
}

export default function Page() {
    const params = useParams()
    const { locale } = params
    const pagePath = params["*"] || "/"
    const { pageDefinition, surveyWithSitemap } = useLoaderData<typeof loader>()
    const pageContext = {
        currentSurvey: surveyWithSitemap as any,
        currentEdition: surveyWithSitemap,
        localeId: locale || "en-US",
        localePath: "en-US",
        // TODO: dummy values just so TS is happy, see gatsby implem to craft actual values
        block: pageDefinition.blocks?.[0],
        id: pageDefinition.id,
        currentPath: pagePath || "/",
        path: pagePath || "/", basePath: pagePath, host: "localhost", titleId: pageDefinition.id, intlId: pageDefinition.id, pageData: {}
    }
    // TODO: make it an actual layout
    return <LayoutWrapper pageContext={pageContext}>
        <div>
            <div>Current locale in page: {locale}</div>
            <div>Current path: {pagePath} </div>
        </div>
    </LayoutWrapper>
}