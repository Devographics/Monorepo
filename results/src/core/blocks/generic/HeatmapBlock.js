import React, { memo } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/Block'
import HeatmapChart from 'core/charts/generic/HeatmapChart'
import { useI18n } from 'core/i18n/i18nContext'
import ChartContainer from 'core/charts/ChartContainer'
import { useBucketKeys } from 'core/helpers/useBucketKeys'

const HeatmapBlock = ({ block, data }) => {
    const { translate } = useI18n()

    const { subject, heatmapId } = block.variables

    const title = translate(`blocks.${subject}_${heatmapId}_heatmap.title`)
    const description = translate(`blocks.${subject}_${heatmapId}_heatmap.description`)

    const bucketKeys = useBucketKeys(heatmapId)

    return (
        <Block data={data.buckets} block={{ ...block, title, description }}>
            <ChartContainer>
                <HeatmapChart
                    bucketKeys={bucketKeys}
                    data={data.buckets}
                    i18nNamespace={block.variables.heatmapId}
                />
            </ChartContainer>
        </Block>
    )
}

HeatmapBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        variables: PropTypes.shape({
            subject: PropTypes.oneOf(['tools', 'features']).isRequired,
            heatmapId: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
    data: PropTypes.shape({
        year: PropTypes.number.isRequired,
        buckets: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                total: PropTypes.number.isRequired,
                ranges: PropTypes.arrayOf(
                    PropTypes.shape({
                        range: PropTypes.string.isRequired,
                        count: PropTypes.number.isRequired,
                        percentage: PropTypes.number.isRequired,
                    })
                ).isRequired,
            })
        ).isRequired,
    }),
}

export default memo(HeatmapBlock)
