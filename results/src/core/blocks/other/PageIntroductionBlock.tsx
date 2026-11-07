import React from 'react'
import styled from 'styled-components'
import { mq } from 'core/theme'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from '@devographics/react-i18n'

const PageIntroductionBlock = ({ block }) => {
    const context = usePageContext()
    const { currentEdition } = context
    const { getString, getFallbacks } = useI18n()

    const contents = block.variables?.contents

    const keysList = [
        block.descriptionId,
        `sections.${context.intlId || context.id}.description.${currentEdition.id}`,
        `sections.${context.intlId || context.id}.prompt.${currentEdition.id}`,
        `sections.${context.intlId || context.id}.description`,
        `sections.${context.intlId || context.id}.prompt`
    ]
    const tObject = getFallbacks(keysList)

    if (!tObject?.missing) {
        return (
            <Introduction
                className="Page__Introduction"
                dangerouslySetInnerHTML={{ __html: tObject?.tHtml }}
            />
        )
    } else {
        return null
    }
}

const Introduction = styled.div`
    @media ${mq.smallMedium} {
        margin-bottom: var(--doubleSpacing);
    }

    @media ${mq.large} {
        font-size: var(--fontSizeLarge);
        margin-bottom: var(--quadrupleSpacing);
    }
`

export default PageIntroductionBlock
