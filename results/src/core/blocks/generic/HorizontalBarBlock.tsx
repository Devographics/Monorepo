import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { FacetItem, BlockComponentProps } from 'core/types'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: FacetItem
}

const HorizontalBarBlock = ({ block, data }: HorizontalBarBlockProps) => {
    const {
        id,
        mode = 'relative',
        defaultUnits = 'percentage_survey',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id,
        colorVariant,
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const { completion, buckets } = data

    const { total } = completion

    return (
        <Block
            units={units}
            setUnits={setUnits}
            data={data}
            tables={[
                getTableData({
                    data: data.buckets,
                    valueKeys: ['percentage_survey', 'percentage_question', 'count'],
                    translateData,
                    i18nNamespace: chartNamespace,
                }),
            ]}
            block={block}
            completion={completion}
        >
            <ChartContainer fit={false}>
                <HorizontalBarChart
                    total={total}
                    buckets={buckets}
                    i18nNamespace={chartNamespace}
                    translateData={translateData}
                    mode={mode}
                    units={units}
                    colorVariant={colorVariant}
                />
            </ChartContainer>
        </Block>
    )
}

HorizontalBarBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        dataPath: PropTypes.string.isRequired,
        showDescription: PropTypes.bool,
        translateData: PropTypes.bool,
        mode: PropTypes.oneOf(['absolute', 'relative']),
        defaultUnits: PropTypes.oneOf(['percentage_survey', 'percentage_question', 'count']),
        colorVariant: PropTypes.oneOf(['primary', 'secondary']),
    }).isRequired,
    data: PropTypes.shape({
        buckets: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
            })
        ).isRequired,
    }).isRequired,
}

export default memo(HorizontalBarBlock)
