import React from 'react'
import styled from 'styled-components'

import { spacing } from 'core/theme'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockVariantDefinition } from 'core/types'

const Content = styled.div`
    li {
        margin-bottom: ${spacing(0.5)};
    }
    p:last-child {
        margin-bottom: 0;
    }
`

const TextBlock = ({ block }: { block: BlockVariantDefinition }) => {
    const { id } = block
    const cssClass = `block block--text`

    return (
        <div className={cssClass}>
            <Content className="block__content">
                <T k={id} md={true} html={true} />
            </Content>
        </div>
    )
}

export default TextBlock
