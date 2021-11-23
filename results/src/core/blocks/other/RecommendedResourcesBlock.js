import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import ReactGA from 'react-ga'
import Link from 'core/components/LocaleLink'
import resources from 'Config/recommended_resources.yml'
import BlockTitle from 'core/blocks/block/BlockTitle'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
import config from 'Config/config.yml'
import T from 'core/i18n/T'

const trackClick = (id, resource, label) => {
    ReactGA.event({
        category: 'Sponsor Clicks',
        action: `${id}: ${resource.name}`,
        label,
    })
}

const RecommendedResourcesBlock = ({ block, data }) => {
    const { items: sponsors } = block

    if (!sponsors) {
        return null
    }
    const { id } = block
    const sectionResources = resources.filter((r) => sponsors.includes(r.id))

    if (!sectionResources.length) {
        return null
    }

    return (
        <div className="Block">
            <div className="resources">
                <BlockTitle
                    block={{ ...block, showDescription: false }}
                    isExportable={false}
                    isShareable={false}
                />
                <List className="Resources__list">
                    {sectionResources.map((resource) => {
                        const url = resource.url.includes('utm_source')
                            ? resource.url
                            : `${resource.url}?utm_source=${config.siteContext}&utm_medium=sponsor&utm_campaign=${id}`

                        return (
                            <Resource key={resource.name} className="Resource">
                                <ResourceImage
                                    className="Resource__image"
                                    isWide={resource.imageRatio === 'wide'}
                                >
                                    <ResourceImageInner>
                                        <a
                                            onClick={() => trackClick(id, resource, 'text')}
                                            href={`${url}&utm_content=textlink`}
                                            style={{
                                                backgroundImage: `url(${resource.image})`,
                                            }}
                                            title={resource.name}
                                        >
                                            {resource.name}
                                        </a>
                                    </ResourceImageInner>

                                    {resource.teacher && (
                                        <ResourceTeacher>{resource.teacher}</ResourceTeacher>
                                    )}
                                </ResourceImage>
                                <ResourceContent className="Resource__content">
                                    <Title className="Resource__title">
                                        <a
                                            onClick={() => trackClick(id, resource, 'text')}
                                            href={`${url}&utm_content=textlink`}
                                        >
                                            {resource.name}
                                        </a>
                                    </Title>
                                    <Description className="Resource__description">
                                        {resource.description}
                                    </Description>
                                </ResourceContent>
                            </Resource>
                        )
                    })}
                </List>
                <Sponsoring className="Resources__sponsoring">
                    <T k="partners.thanks" />{' '}
                    <Link to="/support">
                        <T k="partners.learn_more" />
                    </Link>
                </Sponsoring>
            </div>
        </div>
    )
}

RecommendedResourcesBlock.propTypes = {
    section: PropTypes.string,
}

const List = styled.div`
    @media ${mq.large} {
        display: grid;
        grid-template-columns: auto auto;
        grid-gap: ${spacing(2)};
    }
`

const Title = styled.h4`
    margin-bottom: 0;
`

const Description = styled.div`
    font-size: ${fontSize('smallish')};
`

const Resource = styled.div`
    margin-bottom: ${spacing()};

    @media ${mq.mediumLarge} {
        display: flex;
    }
`

const ResourceImage = styled.div`
    @media ${mq.small} {
        width: 60px;
        float: right;
        margin: 0 0 ${spacing()} ${spacing()};
    }

    @media ${mq.mediumLarge} {
        width: 130px;
        margin-right: ${spacing()};
        ${({ isWide }) =>
            isWide &&
            css`
                width: 150px;
            `}
    }

    a {
        display: block;
        width: 100%;

        padding-bottom: 90%;
        ${({ isWide }) =>
            isWide &&
            css`
                padding-bottom: 50%;
            `}

        height: 0;
        background-position: center center;
        background-size: cover;
        line-height: 0;
        font-size: 0;
        color: transparent;
    }

    img,
    svg {
        display: block;
        width: 100%;
        border: 3px solid white;
    }
`
const ResourceImageInner = styled.div`
    background: ${({ theme }) => theme.colors.text};
    position: relative;
    z-index: 10;
    border: 2px solid ${({ theme }) => theme.colors.text};
`

const ResourceContent = styled.div`
    flex: 1;
`

const Sponsoring = styled.div`
    font-weight: ${fontWeight('bold')};
    font-size: ${fontSize('smaller')};
    text-align: center;
    margin-top: ${spacing()};
`

const ResourceTeacher = styled.div`
    text-align: center;
    margin-top: ${spacing(0.5)};
    font-size: ${fontSize('small')};
`

export default RecommendedResourcesBlock
