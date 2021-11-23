import React from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import T from 'core/i18n/T'

const PageIntroductionBlock = ({ block }) => (
    <Introduction className="Page__Introduction">
        <T k={`sections.${block.pageId}.description`} md={true} />
    </Introduction>
)

const Introduction = styled.div`
    @media ${mq.smallMedium} {
        margin-bottom: ${spacing(2)};
    }

    @media ${mq.large} {
        font-size: ${(props) => props.theme.typography.size.large};
        margin-bottom: ${spacing(4)};
    }
`

export default PageIntroductionBlock
