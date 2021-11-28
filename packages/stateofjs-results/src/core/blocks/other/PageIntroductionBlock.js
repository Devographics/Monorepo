import React from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'

const PageIntroductionBlock = () => {
    const page = usePageContext()
    return (
        <Introduction className="Page__Introduction">
            <T k={`sections.${page.id}.description`} md={true} />
        </Introduction>
    )
}

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
