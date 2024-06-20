import { getBlockNoteKey } from 'core/helpers/blockHelpers'
import './Note.scss'
import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { BlockVariantDefinition } from 'core/types'

export const Note = ({
    block,
    children
}: {
    block: BlockVariantDefinition
    children?: JSX.Element
}) => {
    const { getString } = useI18n()
    const noteKey = getBlockNoteKey({ block })
    const note = getString(noteKey, {})?.tHtml
    if (children) {
        return <div className="chart-note">{children}</div>
    } else if (note) {
        return <div className="chart-note" dangerouslySetInnerHTML={{ __html: note }} />
    } else {
        return null
    }
}
