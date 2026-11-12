import React from 'react'
import styled from 'styled-components'
import T from 'core/i18n/T'

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
    background: var(--backgroundAltColor);
    padding: var(--spacing);
    margin-bottom: var(--doubleSpacing);
`

export default LivestreamBlock
