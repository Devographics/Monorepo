/**
 * Generate charts on the fly
 * Pro:
 * - no need to store the charts, we rely on the HTTP/CDN layer caching mechanisms
 * Cons:
 * - Cannot support filters, that are too big to fit a URL 
 */
import express from "express"
import { ChartFilter, fetchChartData } from "./chart-data-fetcher"
import { renderChartSvg, svg2png } from "./chart-renderer"
import { getConfig } from "./config"

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
flyGenerator.get("/generate", async (req, res) => {
    // Compute the chart data
    const filter = req.body.filter as ChartFilter
    const data = await fetchChartData(filter)
    // Generate the image
    const chartSvg = await renderChartSvg(data)
    const chartPng = await svg2png(chartSvg)
    return res.sendFile(chartPng)
})

flyGenerator.get("/og", async (req, res) => {
    const { appUrl } = getConfig()
    res.send(`
    <meta property="og:image" content="${appUrl}/generate/fly?filter=${req.query.filter}"
    <meta http-equiv="refresh" content="5; URL=TODO THE RESULT APP URL">
    `)
})