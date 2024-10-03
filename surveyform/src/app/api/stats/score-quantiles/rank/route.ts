import { computeUserRank } from "~/lib/responses/scoreQuantiles";

import { NextRequest, NextResponse } from "next/server";
import { HandlerError } from "~/lib/handler-error";
import { getSurveyformStatsCollection } from "~/lib/stats/model";

/**
 *
 * NOTE: similar code exists in API to compute more advanced facetted quantiles
 * This endpoint is protected by a secret key
 *
 * /api/stats/score-quantiles/compute?editionId=html2023&key=XXX
 * (key = SECRET_KEY env variable)
 *
 * @returns A table where percentiles[i] = the score for percentile i
 * To compute user rank, find the first index that is above user score
 * Score = 350 and percentiles = [100,200, 570] => user is in the top (100-2) = 98%
 */
export const GET = async (req: NextRequest) => {
  try {
    // css2023
    const editionId = req.nextUrl.searchParams.get("editionId");
    if (!editionId)
      throw new HandlerError({
        id: "no-edition-id-params",
        message: "No editionId in search params",
      });
    const scoreStr = req.nextUrl.searchParams.get("score");
    if (!scoreStr)
      throw new HandlerError({
        id: "no-score-params",
        message: "No score in search params",
      });
    const score = parseInt(scoreStr);
    if (isNaN(score))
      throw new HandlerError({
        id: "score-nan",
        message: "Score is not a number",
      });
    // Store in database
    const SurveyStats = await getSurveyformStatsCollection();
    const globalScore = (
      await SurveyStats.findOne({ editionId, kind: "quantiles-global-score" })
    )?.globalScore;

    // top 100%
    if (!globalScore) {
      console.warn(` found in database for survey ${editionId}, 
            call the '/api/stats/score-quantiles/compute?editionId=${editionId}&key=SECRET_KEY' endpoint to update score quantiles`);
      if (!globalScore) return NextResponse.json({ data: 100 });
    }
    const rank = computeUserRank(score, globalScore);
    return NextResponse.json({ data: rank });
  } catch (err) {
    if (err instanceof HandlerError) return err.toNextResponse(req);
    throw err;
  }
};
