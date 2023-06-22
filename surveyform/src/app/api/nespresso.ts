import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { NextRequest, NextResponse } from "next/server";

type ExpressMiddleware = (expressReq: ExpressRequest, expressRes: ExpressResponse, next: () => void) => void

interface ExpressMiddlewareCtx {
    expressReq: ExpressRequest,
    expressRes: ExpressResponse,
    sendCall?: any,
    endCall?: any
    redirectCall?: any
}
function runMiddleware(mds: Array<ExpressMiddleware>, i: number, ctx: ExpressMiddlewareCtx) {
    ctx.expressRes = {
        ...ctx.expressRes,
        send(...args) {
            console.log("sending", args)
            if (ctx.sendCall) {
                throw new Error("already sent")
            }
            ctx.sendCall = args
        },
        end(...args) {
            console.log("ending", args)
            if (ctx.sendCall) {
                throw new Error("already ended")
            }
            ctx.endCall = args
        },
        redirect(...args) {
            console.log("redirect")
            ctx.redirectCall = args
        }
    }
    function next() {
        if (i === mds.length - 1) {
            throw new Error("no next middleware")
        }
        runMiddleware(mds, i + 1, ctx)
    }
    const middleware = mds[i]
    middleware(ctx.expressReq, ctx.expressRes, next)
    return ctx
}
/**
 * Turn a chain of middlewares into a Next Route Handler
 */
export function nespresso(...middlewares: Array<ExpressMiddleware>) {
    return function (req: NextRequest): NextResponse {
        let expressReq: ExpressRequest = {
            ...req,
            params: req.nextUrl.searchParams,
            locals: {}
        }
        let expressRes: ExpressResponse = {
            headers: {}
        }
        const ctx: ExpressMiddlewareCtx = { expressReq, expressRes }
        runMiddleware(middlewares, 0, ctx)
        if (ctx.sendCall) {
            return NextResponse.json(ctx.sendCall)
        } else if (ctx.endCall) {
            return NextResponse.json({})
        } else if (ctx.redirectCall) {
            return NextResponse.redirect(ctx.redirectCall[0])
        }
        return NextResponse.json({ error: "no response from middleware" }, { status: 500 })
    }

}