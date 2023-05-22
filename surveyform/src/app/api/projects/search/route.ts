import { NextRequest, NextResponse } from "next/server";
import { ServerError } from "~/lib/server-error";
import { searchProjects } from "~/lib/projects/db-actions/search";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const query = req.nextUrl.searchParams.get("query");
    const projects = (query && (await searchProjects({ query }))) || [];
    return NextResponse.json({ data: projects });
  } catch (error) {
    if (error instanceof ServerError) {
      return await error.toNextResponse(req);
    } else {
      return NextResponse.json(
        { error: `Could not load response` },
        { status: 500 }
      );
    }
  }
}
