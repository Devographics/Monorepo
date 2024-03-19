import React from 'react'
import { ChartValues } from '../multiItemsExperience/types'
import { OptionMetadata, QuestionMetadata } from '@devographics/types'
import { useColorScale } from '../horizontalBar2/helpers/colors'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { getQuestionOptions } from '../horizontalBar2/helpers/options'
import { ChartState } from '../horizontalBar2/types'

export const Legend = ({
    chartState,
    chartValues
}: {
    chartState: ChartState
    chartValues: ChartValues
}) => {
    const { facetQuestion: question } = chartValues
    if (!question) {
        return null
    }
    const options = getQuestionOptions({ question, chartState })
    const colorScale = chartValues?.facetQuestion && useColorScale({ question })
    if (!options) {
        return null
    } else {
        return (
            <div className="chart-legend">
                <h3>{chartValues?.facetQuestion?.id} Options</h3>
                <div className="chart-legend-items">
                    {options.map(option => (
                        <LegendItem
                            key={option.id}
                            chartValues={chartValues}
                            option={option}
                            color={colorScale[option.id]}
                        />
                    ))}
                </div>
            </div>
        )
    }
}

const LegendItem = ({
    option,
    color,
    chartValues
}: {
    option: OptionMetadata
    color: string
    chartValues: ChartValues
}) => {
    const { facetQuestion } = chartValues
    const { getString } = useI18n()
    const style = {
        '--color': color[0]
    }
    const { id, entity } = option
    const { label, key } = getItemLabel({ id, entity, getString, i18nNamespace: facetQuestion?.id })
    return (
        <div style={style} className="legend-item">
            <div className="legend-item-color" />
            {label}
        </div>
    )
}

export default Legend
