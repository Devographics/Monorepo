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
    ranks: Array<{
        score: number,
        /** = proportion or users with score greater or equal */
        rank: number
    }>
}

/**
 * Must be triggered during the survey to update the quantile computation to score people
 * It is costly, so we don't want to call it for each response, but only every X minutes
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
        const scoreRank = {
            score,
            // rank cannot be zero so the best are in the "top 1%"
            rank: 100 - Math.floor(currentPercentage)
        }
        currentPercentage += proportion
        return scoreRank
    })
    return { totalCount, maxScore, buckets, ranks }

}
/**
 * User is in the top X% (as a whole number)
 * = how many users you managed to beat with this score, in proportion of the total
 */
export function computeUserRank(score: number, globalScores: GlobalScores) {
    if (score >= globalScores.maxScore) {
        return .1; // we avoid "top 0%"
    }
    else if (score === 0) {
        return 100;
    }

    // @ts-ignore
    const rank = globalScores.ranks.findLast((stats) => stats.score <= score)?.rank ?? 100;
    return Math.max(1, rank);
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