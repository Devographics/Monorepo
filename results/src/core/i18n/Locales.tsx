import React from 'react'
import styled from 'styled-components'
import { usePageContext } from 'core/helpers/pageContext'
import { Link } from 'gatsby'
import { mq } from 'core/theme'
import BlockCompletionIndicator from 'core/blocks/block/BlockCompletionIndicator'

const Container = styled.div`
    @media ${mq.large} {
        display: grid;
        grid-template-columns: auto auto;
        grid-column-gap: calc(var(--spacing) * 1.5);
        grid-row-gap: calc(var(--spacing) * 1.5);
    }
`

const Item = styled.span`
    text-align: center;
    font-size: var(--fontSizeMedium);
    display: flex;
    align-items: center;
    white-space: nowrap;
    @media ${mq.smallMedium} {
        font-size: var(--fontSizeSmall);    
    }
    @media ${mq.large} {
        font-size: var(--fontSizeMedium);
    }
    
    &._is-current {
        font-weight: var(--fontBold);
    }
}
`

export const Locales = () => {
    const context = usePageContext()
    const locales = context?.locales || []
    const links = locales.map(locale => {
        return {
            ...locale,
            link: locale.path + context.basePath,
            isCurrent: locale.locale === context.locale
        }
    })

    return (
        <Container className="Locales">
            {links.map(({ label, id, link, isCurrent, completion }) => (
                <Item key={id} className={`Locales__Item${isCurrent ? ' _is-current' : ''}`}>
                    <Link to={link}>{label}</Link>
                    {completion < 95 && (
                        <BlockCompletionIndicator
                            completion={{ percentage: completion }}
                            variant="grey"
                        />
                    )}
                </Item>
            ))}
        </Container>
    )
}
