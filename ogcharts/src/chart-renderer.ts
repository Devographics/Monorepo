// *** Generating images

import { ChartData } from "./chart-data-fetcher"

export async function renderChartSvg(chartData: ChartData): Promise<string> {
    // TODO: use React server-side rendering to generate a chart
    // we night need to make the file a tsx file and thus setup the bundler accordingly to support React code
    return "<svg></svg>" // TODO: use a test image
}
export async function svg2png(html: string): Promise<Buffer> {
    // TODO: turn the SVG into a PNG image
    // not sure yet which lib to use but we can opt for the lightest one
    return new Buffer() // TODO: use a test image
}