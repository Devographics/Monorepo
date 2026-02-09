import React from 'react'

import { BlockVariantDefinition } from 'core/types'

const ImageBlock = ({ block }: { block: BlockVariantDefinition }) => {
    const { id, variables } = block
    const { title, imageUrl } = variables
    console.log(block)
    return (
        <div className="block block--image">
            {title && <h2 className="block__title">{title}</h2>}
            <img src={imageUrl} />
        </div>
    )
}

export default ImageBlock
