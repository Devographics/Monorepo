import React from 'react'
import { format } from 'd3-format'
import get from 'lodash/get'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import { useI18n } from 'core/i18n/i18nContext'
import Button from 'core/components/Button'

const starsFormatter = format('.2s')

const ToolHeaderBlock = ({ block, data }) => {
    const { translate } = useI18n()

    const toolName = get(data, 'entity.name')
    const homepageLink = get(data, 'entity.homepage')
    const description = get(data, 'entity.description')
    const githubLink = get(data, 'entity.github.url')
    const stars = get(data, 'entity.github.stars')
    // const npmLink = get(data, 'entity.npm')

    return (
        <Container className="ToolHeader">
            <Content className="ToolHeader__Content">
                <Header className="ToolHeader__Header">
                    <Title className="ToolHeader__Title">{toolName}</Title>
                    {stars && (
                        <Stars className="ToolHeader__Stars">
                            {starsFormatter(stars)} {translate('blocks.entity.github_stars')}
                        </Stars>
                    )}
                </Header>
                <Description className="ToolHeader__Description">{description}</Description>
                <Links className="ToolHeader__Links">
                    {homepageLink && (
                        <Link
                            as="a"
                            size="small"
                            className="ToolHeader__Link"
                            href={homepageLink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {translate('blocks.entity.homepage_link')}
                        </Link>
                    )}
                    {githubLink && (
                        <Link
                            as="a"
                            size="small"
                            className="ToolHeader__Link"
                            href={githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {translate('blocks.entity.github_link')}
                        </Link>
                    )}
                </Links>
            </Content>
        </Container>
    )
}

const Container = styled.div`
    @media ${mq.small} {
        margin-bottom: ${spacing(2)};
    }

    @media ${mq.mediumLarge} {
        display: flex;
        margin-bottom: ${spacing(4)};
    }
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
`

const Title = styled.h2`
    margin: 0;
    padding: 0;
    align-items: baseline;

    @media ${mq.small} {
        display: none;
    }
    @media ${mq.medium} {
        font-size: 1.5rem;
    }
    @media ${mq.large} {
        font-size: 2rem;
    }
`

const Description = styled.div`
    @media ${mq.small} {
        text-align: center;
        margin: ${spacing()} 0;
    }
`

const Content = styled.div`
    flex: 1;
`

const Stars = styled.div`
    @media ${mq.smallMedium} {
        display: none;
    }
`

const Links = styled.div`
    display: flex;
    align-items: center;
    margin-top: ${spacing(0.5)};

    @media ${mq.small} {
        justify-content: center;
    }
`

const Link = styled(Button)`
    margin-right: ${spacing(0.5)};
`

export default ToolHeaderBlock
