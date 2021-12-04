import React from 'react'
import styled from 'styled-components'
import { usePageContext } from 'core/helpers/pageContext'
import { Link } from 'gatsby'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
import get from 'lodash/get'
import BlockCompletionIndicator from 'core/blocks/block/BlockCompletionIndicator'

const Container = styled.div`
    display: grid;
    grid-template-columns: auto auto;
    grid-column-gap: ${spacing(1.5)};
    grid-row-gap: ${spacing(1.5)};
`

const Item = styled.span`
    text-align: center;
    font-size: ${fontSize('medium')};
    display: flex;
    align-items: center;
    @media ${mq.smallMedium} {
        font-size: ${fontSize('small')};    
    }
    @media ${mq.large} {
        font-size: ${fontSize('medium')};
    }
    
    &._is-current {
        font-weight: ${fontWeight('bold')};
    }
}
`

const Locales = () => {
    const context = usePageContext()
    const links = get(context, 'locales', []).map((locale) => {
        return {
            ...locale,
            link: locale.path + context.basePath,
            isCurrent: locale.locale === context.locale,
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

export default Locales
