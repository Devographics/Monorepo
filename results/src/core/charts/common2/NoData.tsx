import './NoData.scss'
import React from 'react'
import T from 'core/i18n/T'
import ChartWrapper from './ChartWrapper'
import { Note } from './Note'
import ChartFooter from './ChartFooter'
import ChartShare from './ChartShare'
import ChartData from './ChartData'
import { QuestionMetadata } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'

export const NoData = <NoDataProps,>(
    props: NoDataProps & { question: QuestionMetadata; block: BlockVariantDefinition }
) => {
    const { question, block } = props
    return (
        <ChartWrapper block={block} question={question} className="chart-horizontal-bar">
            <>
                <div className="no-data warning">
                    <T k="charts.no_data" />
                </div>

                <Note block={block} />

                <ChartFooter
                    right={
                        <>
                            <ChartShare {...props} />
                            <ChartData {...props} />
                        </>
                    }
                />
            </>
        </ChartWrapper>
    )
}
