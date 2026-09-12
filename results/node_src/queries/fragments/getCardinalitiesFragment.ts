export const getCardinalitiesFragment = () => `_cardinalities {
    buckets {
        answerCount
        count
        percentage
    }
    max
    mean
    n
}
`
