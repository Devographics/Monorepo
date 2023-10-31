import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";

import { runScript } from "~/lib/scripts/actions";

/**
 * @see https://vercel.com/docs/functions/serverless-functions/runtimes#maxduration
 * On PRO offer we are allowed for 300s execution max (default is 10s so too short for scripts)
 */
export const maxDuration = 300

export async function POST(req: NextRequest, { params }: any) {
  let args = await req.json();
  const { id } = args;
  try {
    const data = await runScript(args);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    captureException(error);
    return NextResponse.json(
      {
        error: {
          id: `run_script_${id}_error`,
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
