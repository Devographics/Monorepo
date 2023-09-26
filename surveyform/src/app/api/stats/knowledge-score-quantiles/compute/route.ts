import { getRawResponsesCollection } from "@devographics/mongo"
import { ResponseDocument } from "@devographics/types"
import { NextRequest, NextResponse } from "next/server"
import sortBy from "lodash/sortBy.js"
import { checkSecretKey } from "../../../secretKey"
import { HandlerError } from "~/lib/handler-error"

/**
 * 
 * NOTE: similar code exists in API to compute more advanced facetted quantiles
 * This endpoint is protected by a secret key
 *  
 * /api/stats/knowledge-score-quantiles/compute?editionId=html2023&key=XXX
 * (key = SECRET_KEY env variable)
 * 
 * @returns A table where percentiles[i] = the score for percentile i
 * To compute user rank, find the first index that is above user score
 * Score = 350 and percentiles = [100,200, 570] => user is in the top (100-2) = 98%
 */
export const GET = async (req: NextRequest) => {
    try {
        checkSecretKey(req)

        // css2023
        const editionId = req.nextUrl.searchParams.get("editionId")
        if (!editionId) return NextResponse.json({ error: "No editionId in search params" })
        // TODO: how to guarantee the right indices are set?
        // we probably want an index on knowledgeScore here
        const Responses = await getRawResponsesCollection<ResponseDocument>()
        const countsAgg = Responses.aggregate([{
            $match: {
                editionId
            }
        }, {
            $group: {
                // @see https://www.mongodb.com/docs/manual/meta/aggregation-quick-reference/#std-label-aggregation-expressions
                _id: "$knowledgeScore",
                count: {
                    $count: {}
                }
            }

        }]
        )
        // _id = the knowledgeScore
        const countsSorted = sortBy(await countsAgg.toArray(), "_id") as Array<{ _id: number, count: number }>
        const total = countsSorted.reduce((sum, { count }) => sum + count, 0)
        const maxScore = countsSorted.reduce((s, { _id: knowledgeScore }) => knowledgeScore > s ? knowledgeScore : s, 0)
        // now compute each percentile
        const percentiles = Array(101).fill(maxScore)
        let currentPercentage = 0
        for (let { count, _id: knowledgeScore } of countsSorted) {
            // weight of this group in the total
            const proportion = Math.ceil((100. * count) / total)
            console.log({ count, knowledgeScore, proportion })
            for (let i = currentPercentage; i <= currentPercentage + proportion; i++) {
                percentiles[i] = knowledgeScore
            }
            currentPercentage += proportion
        }
        // TODO: store result in database to serve it later

        return NextResponse.json({ data: percentiles })
        //return NextResponse.json({ error: "Not yet implemented" }, { status: 500 })
    } catch (err) {
        if (err instanceof HandlerError) return err.toNextResponse(req)
        throw err
    }
}