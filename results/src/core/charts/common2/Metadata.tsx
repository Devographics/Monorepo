import Tooltip from 'core/components/Tooltip'
import './Metadata.scss'
import { YearCompletion } from '@devographics/types'
import T from 'core/i18n/T'
import { AverageIcon, MedianIcon, PercentIcon, UserIcon } from 'core/icons'
import { IconProps } from 'core/icons/IconWrapper'
import React from 'react'
import { formatNumber } from './helpers/labels'

export const Metadata = ({
    completion,
    average,
    median
}: {
    completion: YearCompletion
    average?: number
    median?: number
}) => {
    if (!completion) {
        return <div>No completion data</div>
    }
    const { count, percentageSurvey, total } = completion

    const items = [
        { id: 'respondents', icon: UserIcon, value: count, total },
        { id: 'completion', icon: PercentIcon, value: percentageSurvey, total }
    ]
    if (average) {
        items.push({ id: 'average', icon: AverageIcon, value: average, total })
    }
    if (median) {
        items.push({ id: 'median', icon: MedianIcon, value: median, total })
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

const MetadataItem = ({
    id,
    icon,
    value,
    total
}: {
    id: string
    value: number
    icon: (props: IconProps) => React.JSX.Element
    total: number
}) => {
    const Icon = icon
    return (
        <Tooltip
            trigger={
                <div className="chart-metadata-item">
                    <Icon size="petite" />
                    <span className="chart-metadata-item-value">{formatNumber(value)}</span>
                </div>
            }
            contents={
                <T
                    k={`charts.metadata.${id}`}
                    values={{
                        value: formatNumber(value),
                        total: formatNumber(total)
                    }}
                    html={true}
                    md={true}
                />
            }
        />
    )
}

export default Metadata
