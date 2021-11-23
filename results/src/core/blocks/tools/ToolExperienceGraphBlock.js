import React from 'react'
import PropTypes from 'prop-types'
import { useI18n } from 'core/i18n/i18nContext'
import Block from 'core/blocks/block/Block'
import ChartContainer from 'core/charts/ChartContainer'
import ToolExperienceGraphChart from 'core/charts/tools/ToolExperienceGraphChart'

const ToolExperienceGraphBlock = ({ block, data }) => {
    const { translate } = useI18n()

    // skip if there's not enough data to show the block
    if (data.experienceGraph.nodes.length === 0) {
        return null
    }

    const toolName = data.entity.name
    const title = translate(`block.title.${block.blockName}`, { values: { name: toolName } })
    const description = translate(`block.description.${block.blockName}`, {
        values: { name: toolName },
    })

    return (
        <Block
            block={{
                ...block,
                title,
                description,
                showLegend: false,
            }}
            data={data}
        >
            <ChartContainer height={400} fit={true}>
                <ToolExperienceGraphChart data={data.experienceGraph} />
            </ChartContainer>
        </Block>
    )
}

ToolExperienceGraphBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        blockName: PropTypes.string.isRequired,
        dataPath: PropTypes.string.isRequired,
    }).isRequired,
    data: PropTypes.shape({
        entity: PropTypes.shape({
            name: PropTypes.string.isRequired,
        }).isRequired,
        experienceGraph: PropTypes.shape({
            nodes: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    year: PropTypes.number.isRequired,
                    experience: PropTypes.string.isRequired,
                })
            ).isRequired,
            links: PropTypes.arrayOf(
                PropTypes.shape({
                    source: PropTypes.string.isRequired,
                    target: PropTypes.string.isRequired,
                    count: PropTypes.number.isRequired,
                })
            ).isRequired,
        }).isRequired,
    }).isRequired,
}

export default ToolExperienceGraphBlock
