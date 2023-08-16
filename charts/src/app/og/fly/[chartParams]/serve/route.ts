import { NextResponse } from "next/server";

export async function GET() {
    // TODO: generate and serve the image
    // see "ogserve"
    return new NextResponse("TODO.png")
}
/**
 * We use a GET method, so the image can be generated without having to rely
 * on some intermediate storage solution
 * /!\ this endpoint can be called a lot as it will be included in the Open graph image
 * We should rely on HTTP header and trust the proxy/CDN to cache images for us
 */
/*
Code from "ogserve":
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

*/