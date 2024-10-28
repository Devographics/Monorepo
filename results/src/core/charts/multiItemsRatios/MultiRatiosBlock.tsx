import React from 'react'
import '../common2/ChartsCommon.scss'
import './MultiRatios.scss'
import { BlockComponentProps } from 'core/types'
// import { getDefaultState, useChartState } from './helpers/chartState'
// import { getAllEditions } from './helpers/other'
import { ChartControls, ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import { CommonProps } from '../common2/types'
import ChartData from '../common2/ChartData'
import { getBlockNoteKey } from 'core/helpers/blockHelpers'
import { useI18n } from '@devographics/react-i18n'
import RatiosSerie from './RatiosSerie'
import { MultiRatioSerie, MultiRatiosChartState } from './types'
import ChartShare from '../common2/ChartShare'
import { getDefaultState, useChartState } from './helpers/chartState'
import ViewSwitcher from './ViewSwitcher'
import Legend from '../common2/Legend'
import uniqBy from 'lodash/uniqBy'
import ModeSwitcher from './ModeSwitcher'

export interface MultiRatiosBlockProps extends BlockComponentProps {
    series: MultiRatioSerie[]
}

export const MultiRatiosBlock = (props: MultiRatiosBlockProps) => {
    const { getString } = useI18n()
    const { block, series, question, pageContext, variant } = props

    const legendItems = uniqBy(series.map(serie => serie.data).flat(), item => item.id)

    const chartState = useChartState(getDefaultState({ block }))

    const commonProps: CommonProps<MultiRatiosChartState> = {
        variant,
        question,
        series,
        pageContext,
        chartState,
        block
    }

    const key = getBlockNoteKey({ block })
    const note = getString(key, {})?.t

    return (
        <ChartWrapper question={question} className="chart-vertical-bar chart-multi-ratios">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}

                <Legend chartState={chartState} items={legendItems} />
                <ChartControls
                    left={<ModeSwitcher chartState={chartState} />}
                    right={<ViewSwitcher chartState={chartState} />}
                />

                <GridWrapper seriesCount={series.length}>
                    {series.map((serie, serieIndex) => (
                        <RatiosSerie
                            key={serie.name}
                            serie={serie}
                            serieIndex={serieIndex}
                            legendItems={legendItems}
                            {...commonProps}
                        />
                    ))}
                </GridWrapper>

                <Note block={block} />

                <ChartFooter
                    right={
                        <>
                            <ChartShare {...commonProps} />
                            <ChartData {...commonProps} />
                        </>
                    }
                />
            </>
        </ChartWrapper>
    )
}

export default MultiRatiosBlock
