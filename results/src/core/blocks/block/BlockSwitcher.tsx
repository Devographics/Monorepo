import React, { useState } from 'react'
// import globalBlockRegistry from 'core/helpers/blockRegistry'
import blockRegistry from 'Config/blocks'
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockError } from 'core/blocks/block/BlockError'
import { getBlockData } from 'core/helpers/data'

const BlockSwitcher = ({ pageData, block, index, ...props }) => {
    const pageContext = usePageContext()
    const blockData = getBlockData({ block, pageContext })

    const [customData, setCustomData] = useState()
    // console.log(block)
    // console.log(pageData)
    // console.log(blockData)
    const { id, blockType, hidden } = block
    if (!blockRegistry[blockType]) {
        return (
            <BlockError
                block={block}
                message={`Missing Block Component! Block ID: ${id} | type: ${blockType}`}
            />
        )
    }
    console.log({ blockData })
    const BlockComponent = blockRegistry[blockType]
    if (block.query && (!blockData || blockData === null || isEmpty(blockData))) {
        return (
            <BlockError
                block={block}
                message={`No available data for block ${id} | path: ${block.dataPath} | type: ${blockType}`}
            >
                <textarea readOnly value={JSON.stringify(pageData, undefined, 2)} />
            </BlockError>
        )
    }

    const blockEntity = block.entityPath && get(pageData, block.entityPath)

    const customChart = customData && (
        <BlockComponent
            block={{ ...block, entity: blockEntity, chartOnly: true }}
            pageData={pageData}
            data={customData}
            entity={blockEntity}
            index={index}
            context={pageContext}
            {...props}
        />
    )

    return (
        <BlockComponent
            block={{ ...block, entity: blockEntity, setCustomData, customData, customChart }}
            pageData={pageData}
            data={blockData}
            entity={blockEntity}
            index={index}
            context={pageContext}
            {...props}
        />
    )
}

export default BlockSwitcher
