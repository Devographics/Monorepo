import React, { useState } from 'react'
import './MultiItemsExperience.scss'
import {
    Bucket,
    FacetBucket,
    FeaturesOptions,
    SentimentOptions,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import sortBy from 'lodash/sortBy'
import sumBy from 'lodash/sumBy'
import compact from 'lodash/compact'
import { BlockComponentProps } from 'core/types'

enum GroupingOptions {
    EXPERIENCE = 'experience',
    SENTIMENT = 'sentiment'
}

const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

type SectionItemsData = {
    items: StandardQuestionData[]
}

export interface MultiItemsExperienceBlockProps extends BlockComponentProps {
    data: SectionItemsData
    // series: DataSeries<StandardQuestionData>[]
}

export const MultiItemsExperienceBlock = (props: MultiItemsExperienceBlockProps) => {
    console.log(props)
    const { data } = props
    const { items } = data
    const [grouping, setGrouping] = useState<GroupingOptions>(GroupingOptions.EXPERIENCE)
    const [sort, setSort] = useState<FeaturesOptions | SimplifiedSentimentOptions>(
        FeaturesOptions.USED
    )
    const className = `multiexp multiexp-groupedBy-${grouping}`

    const sortedItems = sortBy(items, item => {
        const buckets = item.responses.currentEdition.buckets
        if (grouping === GroupingOptions.EXPERIENCE) {
            const sortingBucket = buckets.find(bucket => bucket.id === sort)
            return sortingBucket?.percentageQuestion
        } else {
            const activeSentimentBuckets = compact(
                buckets.map(bucket => bucket.facetBuckets.find(fb => fb.id === sort)).flat()
            )
            const sentimentTotalPercentage = sumBy(
                activeSentimentBuckets,
                fb => fb.percentageQuestion || 0
            )
            return sentimentTotalPercentage
        }
    })
    return (
        <div className={className}>
            <div className="multiexp-controls multiexp-controls-grouping">
                <h4>Group by:</h4>
                {Object.values(GroupingOptions).map(id => (
                    <Radio
                        key={id}
                        id={id}
                        isChecked={grouping === id}
                        handleChange={() => {
                            setGrouping(id)
                            setSort(sortOptions[id][0])
                        }}
                    />
                ))}
            </div>

            <div className="multiexp-controls multiexp-controls-sort">
                <h4>Sort by:</h4>
                {sortOptions[grouping].map(option => (
                    <Radio
                        key={option}
                        id={option}
                        isChecked={sort === option}
                        handleChange={() => setSort(option)}
                    />
                ))}
            </div>
            <div className="multiexp-rows">
                {sortedItems.map(item => (
                    <Row key={item.id} item={item} grouping={grouping} />
                ))}
            </div>
        </div>
    )
}

const Radio = ({
    id,
    isChecked,
    handleChange
}: {
    id: string
    isChecked: boolean
    handleChange: () => void
}) => {
    return (
        <label htmlFor={id}>
            <input
                type="radio"
                id={id}
                name="grouping"
                value={id}
                checked={isChecked}
                onChange={handleChange}
            />
            {id}
        </label>
    )
}

const experienceOrder = Object.values(FeaturesOptions)
const sentimentOrder = Object.values(SentimentOptions)

const sortByArray = (
    sourceArray: CombinedBucket[],
    sortArray: typeof experienceOrder | typeof sentimentOrder,
    idGetter: (b: CombinedBucket) => string
) => {
    const sortedArray = [...sourceArray]
    sortedArray.sort(
        (a: CombinedBucket, b: CombinedBucket) =>
            sortArray.indexOf(idGetter(a) as never) - sortArray.indexOf(idGetter(b) as never)
    )
    return sortedArray
}

type CombinedBucket = {
    id: string
    bucket: Bucket
    facetBucket: FacetBucket
}

const Row = ({ item, grouping }: { item: StandardQuestionData; grouping: GroupingOptions }) => {
    const buckets = item.responses.currentEdition.buckets
    const flattenedBuckets: CombinedBucket[] = buckets
        .map(bucket =>
            bucket.facetBuckets.map(facetBucket => ({
                id: `${bucket.id}__${facetBucket.id}`,
                bucket,
                facetBucket
            }))
        )
        .flat()

    let sortedBuckets: CombinedBucket[]
    if (grouping === GroupingOptions.EXPERIENCE) {
        sortedBuckets = sortByArray(
            sortByArray(flattenedBuckets, sentimentOrder, b => b.facetBucket.id),
            experienceOrder,
            b => b.bucket.id
        )
    } else {
        sortedBuckets = sortByArray(
            sortByArray(flattenedBuckets, experienceOrder, b => b.bucket.id),
            sentimentOrder,
            b => b.facetBucket.id
        )
    }

    return (
        <div className="multiexp-row">
            <h3 className="multiexp-row-heading">{item.id}</h3>
            <div className="multiexp-items">
                {sortedBuckets.map(combinedBucket => (
                    <Item key={combinedBucket.id} combinedBucket={combinedBucket} />
                ))}
            </div>
        </div>
    )
}

const experienceColors = {
    [FeaturesOptions.NEVER_HEARD]: '#D696F4',
    [FeaturesOptions.HEARD]: '#6A8CE1',
    [FeaturesOptions.USED]: '#78DFED'
}

const sentimentColors = {
    [SimplifiedSentimentOptions.NEGATIVE_SENTIMENT]: '#FA6868',
    [SimplifiedSentimentOptions.NEUTRAL_SENTIMENT]: '#C1C1C1',
    [SimplifiedSentimentOptions.POSITIVE_SENTIMENT]: '#7EE464'
}

const Item = ({ combinedBucket }: { combinedBucket: CombinedBucket }) => {
    const { bucket, facetBucket } = combinedBucket
    const { percentageQuestion } = facetBucket
    const style = {
        '--percentageQuestion': percentageQuestion,
        '--experienceColor': experienceColors[bucket.id as FeaturesOptions],
        '--sentimentColor': sentimentColors[facetBucket.id as SimplifiedSentimentOptions]
    }
    return (
        <div className="multiexp-item" style={style}>
            <div className="multiexp-item-box">
                <div className="multiexp-item-segment multiexp-item-segment-experience"></div>
                <div className="multiexp-item-segment multiexp-item-segment-sentiment"></div>
            </div>
            {/* <div>{combinedBucket.id}</div> */}
            <div>{percentageQuestion}%</div>
        </div>
    )
}

export default MultiItemsExperienceBlock
