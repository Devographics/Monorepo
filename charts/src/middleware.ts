import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { encodeChartParams } from './app/og/chart-params-encoder'
import { ChartParams } from './app/og/typings'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {

    // Next.js only support statically rendering based on route parameters
    // So we encode search parameters defining a chart into a single route param
    // => this enables static rendering based on search params too at the cost of a small URL rewrite
    // NOTE: for debugging purpose you can access the encoded URL directly 
    console.log("middleware pathname", request.nextUrl.pathname)
    if (request.nextUrl.pathname === "/og/prerendered") {
        const chartParams = [...request.nextUrl.searchParams.entries()]
            .reduce((asObject, [key, val]) => ({ ...asObject, [key]: val }), {}) as ChartParams
        chartParams.lang = "en-US"
        console.log("middleware", { chartParams })
        const encodedUrl = new URL(`/og/prerendered/${encodeChartParams(chartParams)}`, request.url)
        console.log("middleware encodedUrl", encodedUrl.toString())
        return NextResponse.rewrite(encodedUrl)
    }
    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/og/:path*',
}