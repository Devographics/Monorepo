import { NextRequest, NextResponse } from "next/server";
import { mongoExportMiddleware } from "~/lib/export/mongoExport";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
    return await mongoExportMiddleware(req)
}