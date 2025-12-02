import React from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from '@devographics/react-i18n'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

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
        margin-bottom: ${spacing(2)};
    }

    @media ${mq.large} {
        font-size: ${props => props.theme.typography.size.large};
        margin-bottom: ${spacing(4)};
    }
`

export default PageIntroductionBlock
