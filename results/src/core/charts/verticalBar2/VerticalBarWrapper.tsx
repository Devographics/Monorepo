import React from 'react'
import '../common2/ChartsCommon.scss'
import './VerticalBar.scss'
import Metadata from '../common2/Metadata'
import { BlockComponentProps } from 'core/types'
import { ResponseEditionData, StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import ChartData from '../common2/ChartData'
import ChartShare from '../common2/ChartShare'
import { VerticalBarSerie } from './VerticalBarSerie'

export interface VerticalBarWrapperProps extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
    children: React.ReactNode
    currentEdition?: ResponseEditionData
}

export const VerticalBarWrapper = (props: VerticalBarWrapperProps) => {
    const { block, series, question, currentEdition, children } = props

    return (
        <ChartWrapper question={question} className="chart-vertical-bar">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}

                <GridWrapper seriesCount={series.length}>
                    {series.map((serie, serieIndex) => (
                        <VerticalBarSerie
                            key={serie.name}
                            serie={serie}
                            serieIndex={serieIndex}
                            {...props}
                        >
                            {children}
                        </VerticalBarSerie>
                    ))}
                </GridWrapper>

                <Note block={block} />

                <ChartFooter
                    left={
                        currentEdition && (
                            <Metadata
                                average={currentEdition.average}
                                median={currentEdition.percentiles?.p50}
                                completion={currentEdition.completion}
                                {...props}
                            />
                        )
                    }
                    right={
                        <>
                            <ChartShare {...props} />
                            <ChartData {...props} />
                        </>
                    }
                />

                {/* <Actions {...props} /> */}
            </>
        </ChartWrapper>
    )
}
