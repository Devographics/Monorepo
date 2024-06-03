import React from 'react'
import '../common2/ChartsCommon.scss'
import './MultiRatios.scss'
import { BlockComponentProps } from 'core/types'
// import { getDefaultState, useChartState } from './helpers/chartState'
// import { getAllEditions } from './helpers/other'
import { ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import { CommonProps } from '../common2/types'
import ChartData from '../common2/ChartData'
import { getBlockNoteKey } from 'core/helpers/blockHelpers'
import { useI18n } from '@devographics/react-i18n'
import RatiosSerie from './RatiosSerie'
import { MultiRatioSerie, MultiRatiosChartState } from './types'
import ChartShare from '../common2/ChartShare'
import { getDefaultState, useChartState } from './helpers/chartState'
import { MultiItemsChartState } from '../multiItemsExperience/types'
import ViewSwitcher from './ViewSwitcher'
import Legend from './Legend'
import uniqBy from 'lodash/uniqBy'

export interface MultiRatiosBlockProps extends BlockComponentProps {
    series: MultiRatioSerie[]
}

export const MultiRatiosBlock = (props: MultiRatiosBlockProps) => {
    const { getString } = useI18n()
    const { block, series, question, pageContext, variant } = props

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

    const allItems = uniqBy(series.map(serie => serie.data).flat(), item => item.id)

    console.log({ allItems })
    return (
        <ChartWrapper className="chart-vertical-bar chart-multi-ratios">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}

                <Legend chartState={chartState} items={allItems} />
                <ViewSwitcher chartState={chartState} />

                <GridWrapper seriesCount={series.length}>
                    {series.map((serie, serieIndex) => (
                        <RatiosSerie
                            key={serie.name}
                            serie={serie}
                            serieIndex={serieIndex}
                            {...commonProps}
                        />
                    ))}
                </GridWrapper>

                <ChartFooter
                    right={
                        <>
                            <ChartShare {...commonProps} />
                            <ChartData {...commonProps} />
                        </>
                    }
                />

                {note && <Note>{note}</Note>}
            </>
        </ChartWrapper>
    )
}

export default MultiRatiosBlock
