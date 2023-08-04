import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  request,
  response,
} from "express";
import { NextRequest, NextResponse } from "next/server";

type ExpressMiddleware = (
  expressReq: ExpressRequest,
  expressRes: ExpressResponse,
  next: () => void
) => void;

interface ExpressMiddlewareCtx {
  expressReq: ExpressRequest;
  expressRes: ExpressResponse;
  sendCall?: any;
  endCall?: any;
  redirectCall?: any;
}
// TODO: use correct types
// function runMiddleware(mds: Array<ExpressMiddleware>, i: number, ctx: ExpressMiddlewareCtx) {
function runMiddleware(mds: Array<ExpressMiddleware>, i: number, ctx: any) {
  console.log("running middleware", { i, ctx });
  ctx.expressRes = {
    ...ctx.expressRes,
    send(...args) {
      console.log("sending", args);
      if (ctx.sendCall) {
        throw new Error("already sent");
      }
      ctx.sendCall = args;
    },
    end(...args) {
      console.log("ending", args);
      if (ctx.sendCall) {
        throw new Error("already ended");
      }
      ctx.endCall = args;
    },
    redirect(...args) {
      console.log("redirect");
      ctx.redirectCall = args;
    },
  };
  function next() {
    if (i === mds.length - 1) {
      throw new Error("no next middleware");
    }
    // we only have a handful middleware so recursivity is ok
    // using a stack would be cleaner, see Connect
    runMiddleware(mds, i + 1, ctx);
  }
  const middleware = mds[i];
  middleware(ctx.expressReq, ctx.expressRes, next);
  return ctx;
}
/**
 * Turn a chain of middlewares into a Next Route Handler
 */
export function nespresso(...middlewares: Array<ExpressMiddleware>) {
  return function (req: NextRequest): NextResponse {
    // inspired from Express codebase
    // TODO: how to properly initialize an Express request?
    // Without that, we have to mimick all features of Express by hand
    // let expressReq = Object.create(request, {}) as Request
    // let expressRes = Object.create(response, {}) as Response
    let expressReq = {
      ...req,
    };
    let expressRes = {
      status(s: number) {
        this.statusCode = s;
        return this;
      },
    };
    // TODO: use correct types
    // const ctx: ExpressMiddlewareCtx = { expressReq, expressRes };
    const ctx: any = { expressReq, expressRes };
    runMiddleware(middlewares, 0, ctx);
    console.log({ ctx });
    if (ctx.sendCall) {
      // we assume JSON for now
      // @ts-ignore
      return NextResponse.json(ctx.sendCall[0], {
        status: ctx.expressRes.statusCode || 200,
      });
    } else if (ctx.endCall) {
      // @ts-ignore
      return NextResponse.json({ status: ctx.expressRes.statusCode || 200 });
    } else if (ctx.redirectCall) {
      return NextResponse.redirect(ctx.redirectCall[0]);
    }
    return NextResponse.json(
      { error: "no response from middleware" },
      { status: 500 }
    );
  };
}
