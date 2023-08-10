/**
 * Filters are too big to fit a GET request URL
 * We need to generate the image before being able to serve it
 * 
 * This demonstration module:
 * - Stores the image in a local folder (currently /tmp for the sake of demonstrating the feature)
 * - Provides a endpoint to serve the stored image later on
 * 
 * Ideally, we should instead store the images in an AWS S3 bucket
 * + map the S3 url to a shorter unique ID in a database
 */
import express from "express"
import { ChartFilter, fetchChartData } from "./chart-data-fetcher"
import { getConfig } from "./config"
import fsPromises from "fs/promises"
import { renderChartSvg, svg2png } from "./chart-renderer"

/**
 * Endpoints:
 * - /generate (POST)   => generate an image for the chart and store it
 * - /serve   (GET)     => server a previously generated image
 * - /og      (GET)     => servers open graph headers with the chart image + redirection to the result app
 */
export const localGenerator = express.Router()

function imgDiskPath(imgUniqueName) {
    return "/tmp/" + imgUniqueName + ".png"
}
function imgPublicUrl(imgUniqueName) {
    const { appUrl } = getConfig()
    // keep in sync with the corresponding endpoint
    return `${appUrl}/local/${imgUniqueName}`
}

/**
 * Storing the image in a local folder
 * Just a demo, we should ideally delegate that to S3
 */
async function generateImgPublicUrlLocal(img: Buffer): Promise<string> {
    // example by storing the image locally
    const imgUniqueName = (new Date()).toISOString()
    // NOTE: since /tmp is not a public folder, 
    // this approach involves creating an endpoint that serves the data
    const imgLocalPath = imgDiskPath(imgUniqueName)
    await fsPromises.writeFile(imgLocalPath, img)
    return imgUniqueName
}

/**
 * Using a POST method let's us handle complex filters
 * This endpoint cannot be used directly to server the image,
 * so it involves an additional layer to store the result image (S3, local file storing)
 * and make it accessible (via any kind of unique identifier)
 */
localGenerator.post("/generate", async (req, res) => {
    // Compute the chart data
    const filter = req.body.filter as ChartFilter
    const data = await fetchChartData(filter)
    // Generate the image
    const chartSvg = await renderChartSvg(data)
    const chartPng = await svg2png(chartSvg)
    // Make the image publicly available (eg storing in a public AWS S3 bucket)
    const imgUniqueName = await generateImgPublicUrlLocal(chartPng)
    const { appUrl } = getConfig()
    // Craft the URL to be shared (the one that servers the OG headers, so different from the image public URL)
    return `${appUrl}/og/${imgUniqueName}`
})

/**
 * This is needed only when storing the images locally, 
 * Storing in a S3 bucket would give an equivalent URL pointing to AWS directly
 */
localGenerator.get("/serve/:imgUniqueName", async (req, res) => {
    const img = await fsPromises.readFile(imgDiskPath(req.params.imgUniqueName))
    // TODO: set proper headers since it's an image
    res.setHeader("Content-type", "application/png")
    res.send(img)
})


/**
 * Server the open graph headers as a web page
 */
localGenerator.get("/og/:imgUniqueName", async (req, res) => {
    res.send(`
    <meta property="og:image" content="${imgPublicUrl(req.params.imgUniqueName)}"
    <meta http-equiv="refresh" content="5; URL=TODO THE RESULT APP URL">
    `)
})

