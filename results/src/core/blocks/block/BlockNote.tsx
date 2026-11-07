import React from 'react'
import styled from 'styled-components'
import { spacing } from 'core/theme'
import { useI18n } from '@devographics/react-i18n'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import { getBlockNote } from 'core/helpers/blockHelpers'
import { BlockVariantDefinition } from 'core/types'
import { getThemeColor } from 'core/theme_new/colors'

const BlockNote = ({ block }: { block: BlockVariantDefinition }) => {
    const pageContext = usePageContext()
    const { getFallbacks } = useI18n()
    if (block.noteKey === null) {
        // hacky way to override default block notes
        return null
    }
    const note = getBlockNote({ block, pageContext, getFallbacks })
    if (!note.missing) {
        return (
            <Note_ className="Block__Note">
                <T k={note.key} md={true} />
            </Note_>
        )
    } else {
        return null
    }
}

export const Note_ = styled.div`
    .rawchartmode & {
        display: none;
    }
    background: ${getThemeColor('background.alt')};
    padding: var(--spacing);
    margin-top: ${spacing(2)};
    font-size: var(--fontSizeSmall);
    p,
    ul,
    ol {
        &:last-child {
            margin: 0;
        }
    }
`

export default BlockNote
