import { getRawResponsesCollection } from "@devographics/mongo";
import { ResponseDocument } from "@devographics/types";
import { NextRequest, NextResponse } from "next/server";
import { checkSecretKey } from "../../../secretKey";
import { HandlerError } from "~/lib/handler-error";
import {
  computeGlobalScore,
  ScoreBucket,
} from "~/lib/responses/scoreQuantiles";
import { getSurveyformStatsCollection } from "~/lib/stats/model";

// NOTE: extending the serverless function duration only works works with Vercel pro account
// It's not needed when self-hosting
export const maxDuration = 300;

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
    checkSecretKey(req);

    // css2023
    const editionId = req.nextUrl.searchParams.get("editionId");
    if (!editionId)
      return NextResponse.json({ error: "No editionId in search params" });
    // TODO: how to guarantee the right indices are set?
    // we probably want an index on knowledgeScore here
    const Responses = await getRawResponsesCollection();
    const countsAgg = Responses.aggregate([
      {
        $match: {
          editionId,
          // important: remove null/undefined knowledgescore
          // also don't keep zeros
          knowledgeScore: { $exists: true, $gt: 0 },
          // before we were computing knowledgeScore as percents
          createdAt: { $gte: new Date("2023-09-26T00:00:00Z") },
        },
      },
      {
        $group: {
          // @see https://www.mongodb.com/docs/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
          _id: "$knowledgeScore",
          count: {
            $count: {},
          },
        },
      },
      {
        $project: {
          score: "$_id",
          count: true,
          _id: false,
        },
      },
    ]);
    const counts = await countsAgg.toArray();
    const globalScore = computeGlobalScore(counts as Array<ScoreBucket>);

    const SurveyStats = await getSurveyformStatsCollection();
    // Store in database

    await SurveyStats.findOneAndUpdate(
      { editionId, kind: "quantiles-global-score" },
      { $set: { globalScore } },
      { upsert: true }
    );
    return NextResponse.json({ data: globalScore });
  } catch (err) {
    if (err instanceof HandlerError) return err.toNextResponse(req);
    throw err;
  }
};
