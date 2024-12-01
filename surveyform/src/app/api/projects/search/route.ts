import { NextRequest, NextResponse } from "next/server";
import { HandlerError } from "~/lib/handler-error";
import { searchProjects } from "~/lib/projects/db-actions/search";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("query");
    const projects = (query && (await searchProjects({ query }))) || [];
    return NextResponse.json({ data: projects });
  } catch (error) {
    if (error instanceof HandlerError) {
      return await error.toNextResponse(req);
    } else {
      return NextResponse.json(
        { error: `Could not load response` },
        { status: 500 }
      );
    }
  }
}
