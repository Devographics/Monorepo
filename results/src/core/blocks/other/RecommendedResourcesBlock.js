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
        label
    })
}

const RecommendedResourcesBlock = ({ block, data }) => {
    const { items: sponsors } = block

    if (!sponsors) {
        return null
    }
    const { id } = block
    const sectionResources = resources.filter(r => sponsors.includes(r.id))

    if (!sectionResources.length) {
        return null
    }

    return (
        <div className="Block">
            <div className="resources">
                <List className="Resources__list">
                    {sectionResources.map(resource => {
                        const url = resource.url.includes('utm_source')
                            ? resource.url
                            : `${resource.url}?utm_source=${config.siteContext}&utm_medium=sponsor&utm_campaign=${id}`

                        return (
                            <Resource key={resource.name} className="Resource">
                                <ResourceImage
                                    className="Resource__image"
                                    isWide={resource.imageRatio === 'wide'}
                                >
                                    <ImageLink
                                        onClick={() => trackClick(id, resource, 'text')}
                                        href={`${url}&utm_content=textlink`}
                                        title={resource.name}
                                        padding={resource.padding} 
                                    >
                                        <ImageImage src={resource.image} alt={resource.name} />
                                    </ImageLink>
                                    {resource.teacher && (
                                        <>
                                            <ResourceTeacher>{resource.teacher}</ResourceTeacher>
                                            <ResourceCompany>{resource.company}</ResourceCompany>
                                        </>
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
                    <T k="sponsors.thanks" />{' '}
                    <Link to="/support">
                        <T k="sponsors.learn_more" />
                    </Link>
                </Sponsoring>
            </div>
        </div>
    )
}

RecommendedResourcesBlock.propTypes = {
    section: PropTypes.string
}

const List = styled.div`
    background: ${({ theme }) => theme.colors.backgroundAlt};
    padding: ${spacing()};
    /* margin-top: ${spacing(1)}; */
    @media ${mq.large} {
        display: grid;
        grid-template-columns: auto auto;
        grid-gap: ${spacing(3)};
    }
`

const Title = styled.h4`
    margin-bottom: 0;
`

const Description = styled.div`
    font-size: ${fontSize('smallish')};
`

const Resource = styled.div`
    @media ${mq.small} {
        margin-bottom: ${spacing()};
    }
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
        width: 100px;
        margin-right: ${spacing(1.5)};
        ${({ isWide }) =>
            isWide &&
            css`
                width: 150px;
            `}
    }
`

const ImageLink = styled.a`
    display: grid;
    place-items: center;
    width: 100%;
    border-radius: 100%;
    padding: ${({ padding }) => padding ? padding+'px' : 0};
    border: 3px solid ${({ theme }) => theme.colors.border};
    border-radius: 100%;
    aspect-ratio: 1/1;
    overflow: hidden;
`
const ImageImage = styled.img`
    display: block;
    width: 100%;
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
    font-weight: ${fontWeight('bold')};
`

const ResourceCompany = styled.div`
    text-align: center;
    margin-top: ${spacing(0)};
    font-size: ${fontSize('smaller')};
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textAlt};
`

export default RecommendedResourcesBlock
