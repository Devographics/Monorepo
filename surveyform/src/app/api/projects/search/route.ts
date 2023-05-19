import { NextRequest, NextResponse } from "next/server";
import { connectToRedis } from "~/lib/server/redis";
import { getRawResponsesCollection } from "@devographics/mongo";
import { ServerError, ServerErrorObject } from "~/lib/validation";
import { tryGetCurrentUser } from "../../users/getters";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    connectToRedis();

    // Get current user
    const currentUser = await tryGetCurrentUser(req);

    // Get responseId
    const responseId = req.nextUrl.searchParams.get("responseId");
    if (!responseId) {
      throw new ServerError({
        id: "missing_response_id",
        message: "Could not find responseId",
        status: 400,
      });
    }

    const RawResponses = await getRawResponsesCollection();
    const response = await RawResponses.findOne({ _id: responseId });
    if (!response) {
      throw new ServerError({
        id: "missing_response_",
        message: `Could not find response ${responseId}`,
        status: 404,
      });
    }

    if (currentUser._id !== response.userId) {
      throw new ServerError({
        id: "not_authorized",
        message: `User ${currentUser._id} is not authorized to access response ${responseId}`,
        status: 404,
      });
    }

    return NextResponse.json({ data: response });
  } catch (error) {
    if (error instanceof ServerError) {
      const error_ = error as ServerErrorObject;
      return NextResponse.json({ error: error_ }, { status: error_.status });
    } else {
      return NextResponse.json(
        { error: `Could not load response` },
        { status: 500 }
      );
    }
  }
}

import { getProjectsCollection } from "@devographics/mongo";

/*

Take a query string and find matching projects
(used for autocompleting based on a partial query string)

*/
export const projectsAutocomplete = async (root, args, context) => {
  const queryString = args?.input?.filter?.name?._like;

  const Projects = await getProjectsCollection();
  const projectsCursor = await Projects.find(
    {
      name: { $regex: queryString, $options: "i" },
    },
    { limit: 20 }
  );
  const projectsArray = await projectsCursor.toArray();

  const result = {
    results: projectsArray.map(({ _id, name }) => ({ _id, name })),
  };

  return result;
};

/*

Take a list of _ids and find matching projects
(used when we already have _ids and want to display labels for better UX)

*/
export const projectsLabels = async (root, args, context) => {
  const ids = args?.input?.filter?._id?._in;

  const Projects = await getProjectsCollection();
  const projectsCursor = await Projects.find({
    _id: { $in: ids },
  });
  const projectsArray = await projectsCursor.toArray();

  const result = {
    results: projectsArray.map(({ _id, name }) => ({ _id, name })),
  };

  return result;
};
