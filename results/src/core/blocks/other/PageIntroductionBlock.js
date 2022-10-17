import React from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from 'core/i18n/i18nContext'

const PageIntroductionBlock = () => {
    const page = usePageContext()
    const { getString } = useI18n()

    const t = getString(`sections.${page.intlId || page.id}.description`)
    return t.missing ? null : (
        <Introduction className="Page__Introduction">
            <T k={`sections.${page.intlId || page.id}.description`} md={true} />
        </Introduction>
    )
}

const Introduction = styled.div`
    @media ${mq.smallMedium} {
        margin-bottom: ${spacing(2)};
    }

    @media ${mq.large} {
        font-size: ${props => props.theme.typography.size.large};
        margin-bottom: ${spacing(4)};
    }
`

export default PageIntroductionBlock
