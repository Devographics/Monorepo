import { computeGlobalScore, computeUserRank } from "./scoreQuantiles"

test("compute global scores from mongo results", () => {
    // dummy result from mongo
    // total=
    // [13.46%; 21.15%; 0.0064 ; 64.74%]
    const countsAgg = [{ score: 0, count: 21 }, { score: 1, count: 33 }, { score: 2, count: 1 }, { score: 3, count: 101 }]
    const gs = computeGlobalScore(countsAgg)
    expect(gs.totalCount).toEqual(156)
    expect(gs.maxScore).toEqual(3)
    expect(gs.ranks.map(({ rank }) => rank)).toEqual([
        100,
        100 - 13,
        100 - 21 - 13,
        100 - 21 - 13 - 1,
    ])
    // below min should give 100%
    expect(computeUserRank(-1, gs)).toEqual(100)
    // min value should give 100%
    expect(computeUserRank(0, gs)).toEqual(100)
    // existing value = 100 - proportion until this value
    expect(computeUserRank(1, gs)).toEqual(100 - 13)
    // above max should give 1%
    expect(computeUserRank(4, gs)).toEqual(1)

    /*

    const percentiles = percentilesFromBuckets(countsAgg)
    expect(percentiles.length).toEqual(101) // 0 to 100%
    console.log(quantiles.percentiles)
    /*expect(quantiles.percentiles).toEqual([
        ...Array(13).fill(0),
        ...Array(21).fill(1),
        ...Array(1).fill(2),
        ...Array(64).fill(3)
    ])*/
})