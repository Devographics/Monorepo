import React from 'react'
import styled from 'styled-components'
import { spacing } from 'core/theme'
import { useI18n } from 'core/i18n/i18nContext'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import { getBlockNoteKey } from 'core/helpers/blockHelpers'
import { BlockDefinition } from 'core/types'

const BlockNote = ({ block }: { block: BlockDefinition }) => {
    const pageContext = usePageContext()
    const { translate } = useI18n()
    if (block.noteId === null) {
        // hacky way to override default block notes
        return null
    }
    const key = getBlockNoteKey({ block })
    const blockNote = translate(key, {}, null)
    if (blockNote) {
        return (
            <Note_ className="Block__Note">
                <T k={key} md={true} />
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
    background: ${props => props.theme.colors.backgroundAlt};
    padding: ${spacing()};
    margin-top: ${spacing(2)};
    font-size: ${props => props.theme.typography.size.small};
    p,
    ul,
    ol {
        &:last-child {
            margin: 0;
        }
    }
`

export default BlockNote
