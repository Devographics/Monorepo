/**
 * Generate charts on the fly
 * Pro:
 * - no need to store the charts, we rely on the HTTP/CDN layer caching mechanisms
 * Cons:
 * - Cannot support filters, that are too big to fit a URL 
 */
import express from "express"
import { ChartFilter, fetchChartData, getChartParams } from "./chart-data-fetcher"
import { renderChartSvg, svg2png } from "./chart-renderer"
import { getConfig } from "./config"

export const FLY_PREFIX = "/fly"
/**
 * Endpoints:
 * - /serve (GET)    => generate and serve an image for the chart on the fly
 * - /og      (GET)     => servers open graph headers with the chart image + redirection to the result app
 */
export const flyGenerator = express.Router()


// *** Generating on the fly => simpler but limited to basic filters

/**
 * We use a GET method, so the image can be generated without having to rely
 * on some intermediate storage solution
 * /!\ this endpoint can be called a lot as it will be included in the Open graph image
 * We should rely on HTTP header and trust the proxy/CDN to cache images for us
 */
flyGenerator.get("/serve", async (req, res) => {
    console.log("Serving image", req.query)
    // Compute the chart data
    const params = getChartParams(req)
    const data = await fetchChartData(params)
    // Generate the image
    const chartSvg = await renderChartSvg(data)
    const chartPng = await svg2png(chartSvg)

    // TODO: to avoid generating the chart multiple time the first time the link is shared,
    // we could setup a caching mechanism that stores the chart locally
    // or cache a promise to the chart rendering computation
    res.setHeader("Content-Type", "application/png")
    res.setHeader("Content-Size", chartPng.byteLength)
    return res.send(chartPng)
})

/**
 * Example:
 * /fly/og?survey=state-of-js&edition=js2022&section=environment&chart=browser
 */
flyGenerator.get("/og", async (req, res) => {
    const { appUrl } = getConfig()
    // validate the provided query params and pass them down
    const chartSearchParams = new URLSearchParams(getChartParams(req) as any).toString()
    // TODO see https://github.com/Devographics/Monorepo/blob/main/results/src/core/helpers/blockHelpers.ts#L174
    res.send(`
    <meta property="og:image" content="${appUrl}/${FLY_PREFIX}/serve?${chartSearchParams}"
    <meta http-equiv="refresh" content="5; URL=TODO THE RESULT APP URL">
    `)
})