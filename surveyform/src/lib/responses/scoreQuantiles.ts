import sortBy from "lodash/sortBy.js"

export interface ScoreBucket {
    score: number, count: number
}

export interface GlobalScores {
    totalCount: number,
    maxScore: number
    /** Sorted by score */
    buckets: Array<ScoreBucket>
    /** Sorted by score */
    ranks: Array<{ score: number, rank: number }>
}

/**
 * Transform groups returned by Mongo into structured buckets
 * @param rawBuckets 
 * @returns 
 */
export function computeGlobalScore(rawBuckets: Array<ScoreBucket>): GlobalScores {
    // sort data by score
    const buckets = sortBy(rawBuckets, "score") as Array<ScoreBucket>
    // max, totals
    const totalCount = buckets.reduce((sum, { count }) => sum + count, 0)
    const maxScore = buckets.reduce((s, { score }) => score > s ? score : s, 0)
    // ranks
    let currentPercentage = 0.
    const ranks = buckets.map(({ count, score }) => {
        const proportion = (count / totalCount) * 100.
        console.log({ score, currentPercentage, proportion })
        const scoreRank = {
            score,
            // rank cannot be zero so the best are in the "top 1%"
            rank: Math.max(100 - Math.floor((proportion + currentPercentage)), 1)
        }
        currentPercentage += proportion
        return scoreRank
    })
    return { totalCount, maxScore, buckets, ranks }

}
/**
 * User is in the top X% (as a whole number)
 */
export function computeUserRank(userScore: number, globalScores: GlobalScores) {
    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/48829
    const rankBelow = globalScores.ranks.findLast(({ score }) => score <= userScore)
    if (!rankBelow) return 100 // user is in the top 100%
    return rankBelow.rank
}

/**
 * Not used yet
 * 
 * From buckets of score, compute percentiles
 * @example
 * Mongo grouping gives:
 * [{ knowledgeScore: 0, count: 21 }, { knowledgeScore: 1, count: 33 }, { knowledgeScore: 2, count: 1 }, { knowledgeScore: 3, count: 101 }]
 * This corresponds to following proportions
 *    [13.46%; 21.15%; 0.0064 ; 64.74%]
 * Percentiles array will be something like:
 * [
 * 0 (13 times)
 * 1 (21 times),
 * 2 (1 time),
 * 3 (64 times)
 * ]
 */
export function percentilesFromBuckets(sb: GlobalScores) {
    // now compute each percentile
    const percentiles = Array(101).fill(sb.maxScore)
    let currentPercentage = 0. // keep the exact float value
    for (let { count, score } of sb.buckets) {
        // weight of this group in the total
        const proportion = (100. * count) / sb.totalCount
        // if score represents 18.7% of the population, it means 18% of the population have a score below
        // => fill until percentile 18
        const percentile = Math.floor(currentPercentage + proportion)
        for (let i = Math.floor(currentPercentage); i <= percentile && i < 100; i++) {
            percentiles[i] = score
        }
        currentPercentage += proportion
    }
    return percentiles
}