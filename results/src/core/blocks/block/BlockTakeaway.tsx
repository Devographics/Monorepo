import React, { memo } from 'react'
import styled from 'styled-components'
import { spacing } from 'core/theme'
import { useBlockTakeaway } from 'core/helpers/blockHelpers'
import { BlockVariantDefinition } from 'core/types'

const BlockTakeaway = ({ block }: { block: BlockVariantDefinition }) => {
    const takeaway = useBlockTakeaway({ block })
    return takeaway ? <Takeaway_ dangerouslySetInnerHTML={{ __html: takeaway }} /> : null
}

const Takeaway_ = styled.div`
    p:last-child {
        margin: 0;
    }
`

export default memo(BlockTakeaway)
