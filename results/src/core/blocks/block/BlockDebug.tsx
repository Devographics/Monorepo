import React from 'react'
import { BlockComponentProps, BlockDefinition, FacetItem } from '@types/index'

export interface BlockDebugProps extends BlockComponentProps {
    block: BlockDefinition
    // should this be optional?
    data: FacetItem
}

const BlockDebug = ({ block, data }: BlockDebugProps) => {
    return (
        <div>
            debug
            <pre className="error error-data">
                <code>{JSON.stringify(data, undefined, 2)}</code>
            </pre>
        </div>
    )
}

export default BlockDebug
