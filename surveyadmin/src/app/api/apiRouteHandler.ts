import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";

// simple api route handler to return error and success messages in a
// consistent manner for all routes
export const getApiRouteHandler =
  (routeName: string, action: (body: any) => any) =>
  async (req: NextRequest) => {
    console.log(`// ${routeName}`);
    try {
      // Get body data as JSON
      let body: any;
      try {
        body = await req.json();
      } catch (err) {
        throw err;
      }
      const data = await action(body);
      const result = { data } as any;
      if (data.success) {
        result.success = data.success;
      }
      return NextResponse.json(result);
    } catch (error) {
      console.error(error);
      captureException(error);
      return NextResponse.json(
        {
          error: {
            id: `${routeName}_error`,
            status: 500,
            message: error.message,
            error,
          },
        },
        { status: 500 }
      );
    }
  };
