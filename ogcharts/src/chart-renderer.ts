// *** Generating images

import { ChartData } from "./chart-data-fetcher"
import fsPromises from "fs/promises"
import path from "path"
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function renderChartSvg(chartData: ChartData): Promise<string> {
    // TODO: use React server-side rendering to generate a chart
    // we night need to make the file a tsx file and thus setup the bundler accordingly to support React code
    return (await fsPromises.readFile(path.join(__dirname, "../demo/demo-chart.svg"))).toString()
}
/**
 * Open Graph doesn't support SVG,
 * so we need to convert the chart to PNG
 * @see https://indieweb.org/The-Open-Graph-protocol#Does_not_support_SVG_images
 */
export async function svg2png(svg: string): Promise<Buffer> {
    // TODO: turn the SVG into a PNG image
    // not sure yet which lib to use but we can opt for the lightest one
    // TODO: this demo supposes a certain folder structur (__dirname is not available in ESM)
    return await fsPromises.readFile(path.join(__dirname, "../demo/demo-chart.png"))
}