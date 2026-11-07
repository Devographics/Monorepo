import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import { getThemeColor } from 'core/theme_new/colors'

const LivestreamBlock = () => {
    return (
        <Livestream>
            <T k="general.livestream_announcement" md={true} />
        </Livestream>
    )
}

const Livestream = styled.div`
    max-width: 700px;
    margin: 0 auto;
    background: ${getThemeColor('background.alt')};
    padding: var(--spacing);
    margin-bottom: ${spacing(2)};
`

export default LivestreamBlock
