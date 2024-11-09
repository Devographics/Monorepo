import Tooltip from 'core/components/Tooltip'
import './Metadata.scss'
import { QuestionMetadata, YearCompletion } from '@devographics/types'
import T from 'core/i18n/T'
import { AverageIcon, MedianIcon, PercentIcon, UserIcon } from 'core/icons'
import { IconProps } from 'core/icons/IconWrapper'
import React from 'react'
import { formatNumber, formatPercentage, formatQuestionValue } from './helpers/format'

export const Metadata = ({
    completion,
    average,
    question,
    median
}: {
    completion: YearCompletion
    average?: number
    median?: number
    question: QuestionMetadata
}) => {
    if (!completion) {
        return <div>No completion data</div>
    }
    const { count, percentageSurvey, total: total_ } = completion
    const total = formatNumber(total_)
    const items = [
        { id: 'respondents', icon: UserIcon, value: formatNumber(count), total },
        { id: 'completion', icon: PercentIcon, value: formatPercentage(percentageSurvey), total }
    ]
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

    return (
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
    )
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
