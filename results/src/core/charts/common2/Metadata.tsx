import Tooltip from 'core/components/Tooltip'
import './Metadata.scss'
import { QuestionMetadata, sortProperties, YearCompletion } from '@devographics/types'
import T from 'core/i18n/T'
import {
    AverageIcon,
    MedianIcon,
    PercentIcon,
    UserIcon,
    CutoffIcon,
    LimitIcon,
    SortDescIcon,
    SortAscIcon
} from '@devographics/icons'
import { IconProps } from 'core/icons/IconWrapper'
import React from 'react'
import { formatNumber, formatPercentage, formatQuestionValue } from './helpers/format'
import { CommonProps, SerieMetadata } from './types'
import { getSerieMetadata } from '../horizontalBar2/helpers/other'
import { useI18n } from '@devographics/react-i18n'

export const Metadata = <T,>({
    completion,
    average,
    total: total_,
    question,
    median,
    series,
    block,
    seriesMetadata
}: CommonProps<T> &
    SerieMetadata & {
        question?: QuestionMetadata
    }) => {
    const { getString } = useI18n()
    const seriesMaxBucketCount = seriesMetadata?.seriesMaxBucketCount

    const firstSerieMetadata = getSerieMetadata({ serie: series[0], block }) || {}
    const { limit, cutoff, axis1Sort } = firstSerieMetadata
    const items = []
    const total = formatNumber(total_ ?? completion?.total ?? 0)

    if (completion) {
        const { count, percentageSurvey } = completion

        items.push({ id: 'respondents', icon: UserIcon, value: formatNumber(count), total })
        items.push({
            id: 'completion',
            icon: PercentIcon,
            value: formatPercentage(percentageSurvey),
            total
        })
    }
    if (average) {
        items.push({
            id: 'average',
            icon: AverageIcon,
            value: formatQuestionValue(average, question),
            total
        })
    }
    if (median) {
        items.push({
            id: 'median',
            icon: MedianIcon,
            value: formatQuestionValue(median, question),
            total
        })
    }

    if (seriesMaxBucketCount && limit && limit < seriesMaxBucketCount) {
        // only show limit if it's actually being enforced
        items.push({
            id: 'limit',
            icon: LimitIcon,
            value: limit
        })
    }
    if (cutoff && cutoff > 1) {
        // only show cutoff if it's actually being enforced
        items.push({
            id: 'cutoff',
            icon: CutoffIcon,
            value: cutoff
        })
    }

    // todo: disabled for now because it doesn't properly reflect
    // todo: dynamic sort when user clicks a facet
    // if (axis1Sort && axis1Sort.property !== sortProperties.OPTIONS) {
    //     items.push({
    //         id: `sort_${axis1Sort.order}`,
    //         icon: axis1Sort.order === 'desc' ? SortDescIcon : SortAscIcon,
    //         value: getString(`chart_units.${axis1Sort.property}`, {}, axis1Sort.property)?.t
    //     })
    // }

    return items.length > 0 ? (
        <div className="chart-metadata">
            {items.map(item => (
                <MetadataItem key={item.id} {...item} />
            ))}

            {/* <T
                k="chart_units.respondents"
                values={{ count, percentage: percentageSurvey, total }}
                html={true}
                md={true}
            /> */}
        </div>
    ) : null
}

export const MetadataItem = ({
    id,
    icon,
    value,
    total
}: {
    id: string
    value: string
    icon: (props: IconProps) => React.JSX.Element
    total: string
}) => {
    const Icon = icon
    return (
        <Tooltip
            trigger={
                <div className="chart-metadata-item">
                    <Icon size="petite" />
                    <span className="chart-metadata-item-value">{value}</span>
                </div>
            }
            contents={
                <T k={`charts.metadata.${id}`} values={{ value, total }} html={true} md={true} />
            }
        />
    )
}

export default Metadata
