import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    return NextResponse("TODO")
}
/**
 * Using a POST method let's us handle complex filters
 * This endpoint cannot be used directly to server the image,
 * so it involves an additional layer to store the result image (S3, local file storing)
 * and make it accessible (via any kind of unique identifier)
 */
/*

Demo code from "ogserve"

localGenerator.post("/generate", async (req, res) => {
    // Compute the chart data
    const params = getChartParams(req)
    const filter = req.body.filter as ChartFilter
    const data = await fetchChartData(params, filter)
    // Generate the image
    const chartSvg = await renderChartSvg(data)
    const chartPng = await svg2png(chartSvg)
    // Make the image publicly available (eg storing in a public AWS S3 bucket)
    const imgUniqueName = await generateImgPublicUrlLocal(chartPng)
    const { appUrl } = getAppConfig()
    // Craft the URL to be shared (the one that servers the OG headers, so different from the image public URL)
    return `${appUrl}/og/${imgUniqueName}`
})

*/