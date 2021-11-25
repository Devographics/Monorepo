import React, {useMemo, useState} from 'react'
import { Pie } from '@nivo/pie'
// @ts-ignore
import Block from 'core/blocks/block/BlockVariant'
import { BlockContext } from 'core/blocks/types'
import { ToolsCardinalityByUserBucket } from 'core/survey_api/tools'

interface SectionToolsCardinalityByUserBlockProps {
    block: BlockContext<
        'sectionToolsCardinalityByUserTemplate',
        'SectionToolsCardinalityByUserBlock'
    >
    data: ToolsCardinalityByUserBucket[]
    units?: 'percentage' | 'count'
}

export const SectionToolsCardinalityByUserBlock = ({
    block,
    data,
    units: defaultUnits = 'percentage',
}: SectionToolsCardinalityByUserBlockProps) => {
    const [units, setUnits] = useState(defaultUnits)
    

    // exclude datums with a percentage lower than 1
    const filteredData = useMemo(() => data.filter(datum => datum.percentage >= 1).reverse(), [data])

    return (
        <Block
            
             
            units={units}
            setUnits={setUnits}
            block={{
                ...block,
                showLegend: false,
            }}
            data={data}
        >
            <Pie
                data={filteredData.map(datum => ({
                    id: datum.cardinality,
                    value: datum.count,
                }))}
                height={400}
                width={400}
                innerRadius={0.6}
                colors={{
                    scheme: 'blues'
                }}
                margin={{
                    top: 40,
                    right: 40,
                    bottom: 40,
                    left: 40,
                }}
            />
        </Block>
    )
}