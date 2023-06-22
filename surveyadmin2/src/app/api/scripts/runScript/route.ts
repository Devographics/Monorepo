import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";

import { runScript } from "~/lib/scripts/actions";

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
