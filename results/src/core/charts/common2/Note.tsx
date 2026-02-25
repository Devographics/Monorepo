import { getBlockNote } from 'core/helpers/blockHelpers'
import './Note.scss'
import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { BlockVariantDefinition } from 'core/types'
import { usePageContext } from 'core/helpers/pageContext'
import T from 'core/i18n/T'

export const Note = ({
    block,
    children
}: {
    block: BlockVariantDefinition
    children?: JSX.Element
}) => {
    const pageContext = usePageContext()
    const { getFallbacks } = useI18n()
    if (block.noteKey === null) {
        // hacky way to override default block notes
        return null
    }
    const note = getBlockNote({ block, pageContext, getFallbacks })
    if (children) {
        return <div className="chart-note">{children}</div>
    } else if (!note?.missing) {
        return (
            <div className="chart-note">
                <T k={note.key} html={true} md={true} />
            </div>
        )
    } else {
        return null
    }
}
