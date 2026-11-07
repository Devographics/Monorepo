import React from 'react'
import styled from 'styled-components'
import { mq } from 'core/theme'
import { Entity } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import T from 'core/i18n/T'
import { useI18n } from '@devographics/react-i18n'
import { getThemeColor } from 'core/theme_new/colors'

/**
 * All awards categories
 */
const TakeawaysBlock = ({
    block,
    data
}: {
    /**
     * First level are "awards categories",
     * second level are the actual awards
     */
    block: BlockVariantDefinition
    data: Array<Entity>
}) => (
    <Wrapper>
        {block.items.map(item => (
            <Takeaway key={item} id={item} />
        ))}
    </Wrapper>
)

const Takeaway = ({ id }) => {
    const { getString } = useI18n()
    const heading = getString(`takeaways.${id}.heading`)?.t
    return (
        <Takeaway_>
            {heading && (
                <Heading_>
                    <T k={`takeaways.${id}.heading`} md={true} html={true} />
                </Heading_>
            )}
            <Content_>
                <T k={`takeaways.${id}`} md={true} html={true} />
            </Content_>
        </Takeaway_>
    )
}
const Wrapper = styled.div`
    margin-bottom: var(--doubleSpacing);
    @media ${mq.small} {
        display: flex;
        flex-direction: column;
        gap: var(--spacing);
    }
    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: var(--doubleSpacing);
        row-gap: var(--doubleSpacing);
    }
`

const Takeaway_ = styled.section`
    font-size: var(--fontSizeLarge);
    background: ${getThemeColor('background.alt')};
    border-radius: 30px;
    padding: var(--spacing);
`

const Heading_ = styled.h3`
    text-transform: uppercase;
    color: ${getThemeColor('text.alt')};
    margin-bottom: var(--quarterSpacing);
    font-weight: var(--fontMedium);
    font-size: var(--fontSizeLarge);
`
const Content_ = styled.div``

export default TakeawaysBlock
