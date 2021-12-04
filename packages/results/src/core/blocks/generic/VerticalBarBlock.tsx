import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { keys } from 'core/bucket_keys'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import VerticalBarChart from 'core/charts/generic/VerticalBarChart'
import { usePageContext } from 'core/helpers/pageContext'
import { useLegends } from 'core/helpers/useBucketKeys'
import T from 'core/i18n/T'
import { FacetItem, BlockComponentProps } from 'core/types'
import { getTableData } from 'core/helpers/datatables'

export interface VerticalBarBlockProps extends BlockComponentProps {
    data: FacetItem
}

const VerticalBarBlock = ({ block, data, keys }: VerticalBarBlockProps) => {
    if (!data) {
        throw new Error(`VerticalBarBlock: Missing data for block ${block.id}.`)
    }
    const {
        id,
        mode = 'relative',
        defaultUnits = 'percentage_survey',
        translateData,
        i18nNamespace,
        colorVariant,
    } = block

    const context = usePageContext()
    const { width } = context

    const [units, setUnits] = useState(defaultUnits)
    const bucketKeys = keys && useLegends(block, keys)

    const { buckets, completion } = data
    const { total } = completion

    return (
        <BlockVariant
            tables={[getTableData({
                legends: bucketKeys,
                data: data.buckets,
                valueKeys: ['percentage_survey', 'percentage_question', 'count'],
                translateData
            })]}
            units={units}
            setUnits={setUnits}
            completion={completion}
            data={data}
            block={block}
            legendProps={{ layout: 'vertical' }}
        >
            <ChartContainer fit={true}>
                <VerticalBarChart
                    bucketKeys={bucketKeys}
                    total={total}
                    buckets={buckets}
                    i18nNamespace={i18nNamespace || id}
                    translateData={translateData}
                    mode={mode}
                    units={units}
                    viewportWidth={width}
                    colorVariant={colorVariant}
                />
            </ChartContainer>
        </BlockVariant>
    )
}

VerticalBarBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        dataPath: PropTypes.string.isRequired,
        bucketKeysName: PropTypes.oneOf(Object.keys(keys)),
        showDescription: PropTypes.bool,
        mode: PropTypes.oneOf(['absolute', 'relative']),
        units: PropTypes.oneOf(['percentage', 'count']),
        view: PropTypes.oneOf(['data', 'viz']),
        colorVariant: PropTypes.oneOf(['primary', 'secondary']),
    }).isRequired,
    data: PropTypes.shape({
        buckets: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            })
        ).isRequired,
    }).isRequired,
}

export default memo(VerticalBarBlock)
