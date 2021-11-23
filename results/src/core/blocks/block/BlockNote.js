import React, { memo } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { spacing } from 'core/theme'
import { useI18n } from 'core/i18n/i18nContext'
import T from 'core/i18n/T'

const BlockNote = ({ block }) => {
    const { translate } = useI18n()
    // for "_others" blocks (freeform answers), replace suffix with ".others"
    const blockId = block.id && block.id.replace('_others', '.others')
    const key = `blocks.${block.blockName || blockId}.note`
    const blockNote = translate(key, {}, null)
    if (blockNote) {
        return (
            <Note className="Block__Note">
                <T k={key} md={true} />
            </Note>
        )
    } else {
        return null
    }
}

BlockNote.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.node,
        titleId: PropTypes.string,
        description: PropTypes.node,
        descriptionId: PropTypes.string,
    }).isRequired,
}

BlockNote.defaultProps = {
    showDescription: true,
    isShareable: true,
}

const Note = styled.div`
    background: ${(props) => props.theme.colors.backgroundAlt};
    padding: ${spacing()};
    margin-top: ${spacing(2)};
    font-size: ${(props) => props.theme.typography.size.small};
    p,
    ul,
    ol {
        &:last-child {
            margin: 0;
        }
    }
`

export default memo(BlockNote)
