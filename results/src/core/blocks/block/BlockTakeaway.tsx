import React, { memo } from 'react'
import styled from 'styled-components'
import { getBlockDescriptionKey, getBlockKey } from 'core/helpers/blockHelpers'
import { BlockVariantDefinition } from 'core/types'
import T from 'core/i18n/T'
import { useI18n } from '@devographics/react-i18n'
import { usePageContext } from 'core/helpers/pageContext'

const BlockTakeaway = ({ block }: { block: BlockVariantDefinition }) => {
    const { getFallbacks } = useI18n()
    const pageContext = usePageContext()
    const takeawayKey = `${getBlockKey({ block })}.takeaway`
    const descriptionKey = getBlockDescriptionKey(block)
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
        // generic block description
        descriptionKey
    ]
    const hasTakeaway = !getFallbacks(keysList)?.missing
    return hasTakeaway ? (
        <Takeaway_>
            <T keysList={keysList} html={true} md={true} />
        </Takeaway_>
    ) : null
}

const Takeaway_ = styled.div`
    p:last-child {
        margin: 0;
    }
`

export default memo(BlockTakeaway)
