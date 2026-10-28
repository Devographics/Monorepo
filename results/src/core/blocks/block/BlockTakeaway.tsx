import React, { memo } from 'react'
import styled from 'styled-components'
import { getBlockDescriptionKey, getBlockKey } from 'core/helpers/blockHelpers'
import { BlockVariantDefinition } from 'core/types'
import T from 'core/i18n/T'
import { useI18n } from '@devographics/react-i18n'
import { usePageContext } from 'core/helpers/pageContext'
import { renderDatapoints } from 'core/helpers/renderDatapoints'

const BlockTakeaway = ({ block }: { block: BlockVariantDefinition }) => {
    const { getFallbacks } = useI18n()
    const pageContext = usePageContext()
    const blockKey = getBlockKey({ block })
    const takeawayKey = `${blockKey}.takeaway`
    const { currentEdition } = pageContext

    let keysList = []
    if (block.takeawayKey) {
        keysList.push(block.takeawayKey)
    }
    keysList = [
        ...keysList,
        // edition-specific takeaway
        `${takeawayKey}.${currentEdition.id}`,
        // generic takeaway
        takeawayKey,
        // descriptionKey specified in sitemap
        block.descriptionKey,
        // generic block description
        `${blockKey}.description`
    ]

    const hasTakeaway = !getFallbacks(keysList)?.missing

    // replace {path} and [text]{path} datapoints with values from the block's data
    const transform = (takeaway: string) =>
        renderDatapoints({ takeaway, pageContext, blockId: block.id })

    return hasTakeaway ? (
        <Takeaway_>
            <T keysList={keysList} html={true} md={true} transform={transform} />
        </Takeaway_>
    ) : null
}

const Takeaway_ = styled.div`
    p:last-child {
        margin: 0;
    }
`

export default memo(BlockTakeaway)
