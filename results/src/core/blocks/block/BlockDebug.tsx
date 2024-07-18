import React from 'react'
import { BlockComponentProps, BlockVariantDefinition, FacetItem } from '@types/index'

export interface BlockDebugProps extends BlockComponentProps {
    block: BlockVariantDefinition
    // should this be optional?
    data: FacetItem
}

const BlockDebug = ({ block, series }: BlockDebugProps) => {
    return (
        <div>
            debug
            <pre className="error error-data">
                <code>{JSON.stringify(series, undefined, 2)}</code>
            </pre>
        </div>
    )
}

export default BlockDebug
