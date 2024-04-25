
import {
    getEnvVar,
    EnvVar,
} from "@devographics/helpers";
import { fetchEditionSitemap } from "@devographics/fetch";
import { processRawSitemap, type SurveyWithSitemap } from "@/lib/sitemap";

// Setting a global value ~ equivalent to Next.js shared "unstable_cache"
// The survey is the same for all pages for a given build
let surveyWithSitemap: SurveyWithSitemap | null = null
/**
 * Get the sitemap and parses it
 * 
 * Astro prefix means the value is safe to render
 * and properly cached if needed
 * Use Astro.locals for a per-request cache
 * @returns 
 */
export async function astroEditionWithSitemap() {
    if (surveyWithSitemap) {
        console.debug("Cache hit surveyWithSitemap")
        return surveyWithSitemap
    }
    console.debug("Cache miss surveyWithSitemap")
    // Each survey edition has its own domain
    // so we can stick to global env variable to pick the edition we want
    const editionId = getEnvVar(EnvVar.EDITIONID);
    const surveyId = getEnvVar(EnvVar.SURVEYID);
    const surveyWithSitemapRes = await fetchEditionSitemap({ editionId, surveyId });
    surveyWithSitemap = surveyWithSitemapRes.data as SurveyWithSitemap
    // Replace raw sitemap by processed one
    surveyWithSitemap.rawSitemap = surveyWithSitemap.sitemap
    // @ts-ignore
    surveyWithSitemap.sitemap = processRawSitemap(surveyWithSitemap.rawSitemap);

    // set default values
    surveyWithSitemap.issuesUrl = surveyWithSitemap.issuesUrl || 'https://github.com/Devographics/Monorepo/issues'
    surveyWithSitemap.discordUrl = surveyWithSitemap.discordUrl || 'https://discord.gg/zRDb35jfrt'

    return surveyWithSitemap
}