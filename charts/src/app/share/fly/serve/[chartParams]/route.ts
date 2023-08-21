import { fetchChartData } from "@/app/share/chart-data-fetcher";
import { decodeChartParams } from "@/app/share/chart-params-encoder";
import { renderChartSvg, svg2png } from "@/app/share/chart-renderer";
import { NextRequest, NextResponse } from "next/server";

/**
 * We use a GET method, so the image can be generated without having to rely
 * on some intermediate storage solution
 * /!\ this endpoint can be called a lot as it will be included in the Open graph image
 * We should rely on HTTP header and trust the proxy/CDN to cache images for us
 */
export async function GET(req: NextRequest, { chartParams }: { chartParams: string }) {
    const params = await decodeChartParams(chartParams)
    const data = await fetchChartData(params)
    // Generate the image
    const chartSvg = await renderChartSvg(data)
    const chartPng = await svg2png(chartSvg)
    // TODO: generate and serve the image
    // see "ogserve"
    return new NextResponse(chartPng, {
        headers: { "content-type": "application/png", "content-size": chartPng.byteLength + "" }
    })
}