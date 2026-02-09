import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'

const HowToHelpBlock = () => {
    return (
        <HowToHelp>
            <T k="how_to_help.content" md={true} />
        </HowToHelp>
    )
}

const HowToHelp = styled.div`
    @media ${mq.large} {
        max-width: 700px;
        margin: 0 auto;
        margin-bottom: ${spacing(4)};
    }
`

export default HowToHelpBlock
