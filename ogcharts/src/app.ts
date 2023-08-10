import express, { json } from "express"
import gql from "graphql-tag"
import { print } from "graphql"
import fsPromises from "fs/promises"

const app = express()
const port = process.env.PORT || 4444

app.use(json())


// *** Common utils

function getConfig() {
    return {
        /**
         * Devographics API
         */
        chartDataApi: process.env.API_URL!, // TODO: reuse name from variables yml
        /**
         * Absolute URL of the application that serves the charts
         * @example https://og.devographics.com/
         */
        appUrl: process.env.APP_URL!
    }

}

// *** Getting charts data

interface ChartFilter {
    // TODO: get from shared code?
}

interface ChartData {

}

async function fetchChartData(filter: ChartFilter): Promise<ChartData> {
    // TODO: validate filter structure with zod
    const { chartDataApi } = getConfig()
    const data = await fetch(chartDataApi, {
        method: "POST",
        // Print + gql is a trick to get formatting
        body: print(gql`TODO ${filter}`),
        headers: {
            "content-type": "application/graphql"
        }
    })
    return data
}

// *** Storing and serving the images (needed only for complex filters)

/**
 * Storing the image on a local folder
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
function imgDiskPath(imgUniqueName) {
    return "/tmp/" + imgUniqueName + ".png"
}
function imgPublicUrl(imgUniqueName) {
    const { appUrl } = getConfig()
    // keep in sync with the corresponding endpoint
    return `${appUrl}/local/${imgUniqueName}`
}
/**
 * This is needed only when storing the images locally, not with S3
 */
app.get("/local/:imgUniqueName", async (req, res) => {
    const img = await fsPromises.readFile(imgDiskPath(req.params.imgUniqueName))
    // TODO: set proper headers since it's an image
    res.setHeader("Content-type", "application/png")
    res.send(img)
})

// *** Generating images

async function renderChartSvg(chartData: ChartData): Promise<string> {
    // TODO: use React server-side rendering to generate a chart
    // we night need to make the file a tsx file and thus setup the bundler accordingly to support React code
    return "<svg></svg>" // TODO: use a test image
}
async function svg2png(html: string): Promise<Buffer> {
    // TODO: turn the SVG into a PNG image
    // not sure yet which lib to use but we can opt for the lightest one
    return new Buffer() // TODO: use a test image
}

// *** Generating with complex filters => require storing the image

/**
 * Using a POST method let's us handle complex filters
 * This endpoint cannot be used directly to server the image,
 * so it involves an additional layer to store the result image (S3, local file storing)
 * and make it accessible (via any kind of unique identifier)
 */
app.post("/generate/stored", async (req, res) => {
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

// *** Serving the open graph page

app.get("/og/stored/:imgUniqueName", async (req, res) => {
    res.send(`
    <meta property="og:image" content="${imgPublicUrl(req.params.imgUniqueName)}"
    <meta http-equiv="refresh" content="5; URL=TODO THE RESULT APP URL">
    `)
})

// *** Generating on the fly => simpler but limited to basic filters

/**
 * We use a GET method, so the image can be generated without having to rely
 * on some intermediate storage solution
 * /!\ this endpoint can be called a lot as it will be included in the Open graph image
 * We should rely on HTTP header and trust the proxy/CDN to cache images for us
 */
app.get("/generate/fly", async (req, res) => {
    // Compute the chart data
    const filter = req.body.filter as ChartFilter
    const data = await fetchChartData(filter)
    // Generate the image
    const chartSvg = await renderChartSvg(data)
    const chartPng = await svg2png(chartSvg)
    // Make the image publicly available (eg storing in a public AWS S3 bucket)
    const imgUniqueName = await generateImgPublicUrlLocal(chartPng)
    // Craft the URL to be shared (the one that servers the OG headers, so different from the image public URL)
    const { appUrl } = getConfig()
    return `${appUrl}/og/${imgUniqueName}`
})

app.get("/og/fly", async (req, res) => {
    const { appUrl } = getConfig()
    res.send(`
    <meta property="og:image" content="${appUrl}/generate/fly?filter=${req.query.filter}"
    <meta http-equiv="refresh" content="5; URL=TODO THE RESULT APP URL">
    `)
})

app.listen(port, () => {
    console.log(`Open Graph chart app listening on port ${port}`)
})