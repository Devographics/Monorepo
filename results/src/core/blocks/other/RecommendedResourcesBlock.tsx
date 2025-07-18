import React from 'react'
import styled, { css } from 'styled-components'
import Link from 'core/components/LocaleLink'
import resources from 'Config/recommended_resources.yml'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import { RecommendedResource, RecommendedResourceJob } from 'core/types/other'
import './RecommendedResources.scss'

const trackClick = (id, resource, label) => {
    // TODO: add plausible event tracking
}

const RecommendedResourcesBlock = ({ block, data }) => {
    const context = usePageContext()
    const { items: sponsors, variables = {} } = block
    const { isEvent = false } = variables

    if (!sponsors) {
        return null
    }
    const { id } = block
    const sectionResources: RecommendedResource[] = sponsors
        .map((sponsorId: string) => resources.find(r => r.id === sponsorId))
        .filter(s => !!s)

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
                            : `${resource.url}?utm_source=${context.currentEdition.id}&utm_medium=sponsor&utm_campaign=${id}`

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
                                        className="resource-image-link"
                                    >
                                        <ImageImage
                                            src={resource.image}
                                            alt={resource.name}
                                            className="resource-image-image"
                                        />
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
                                    <Description
                                        className="Resource__description"
                                        dangerouslySetInnerHTML={{ __html: resource.description }}
                                    />
                                    {resource.jobs && <Jobs resource={resource} />}
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

const Jobs = ({ resource }: { resource: RecommendedResource }) => {
    const { jobs } = resource
    return (
        <div className="recommended-resource-jobs">
            {jobs?.map((job, i) => (
                <Job key={i} job={job} />
            ))}
        </div>
    )
}
const Job = ({ job }: { job: RecommendedResourceJob }) => {
    const { position, company, url } = job
    return (
        <a href={url} className="recommended-resource-job">
            <h5>{company}</h5>
            <h4>{position}</h4>
        </a>
    )
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
    padding: ${({ padding }) => (padding ? padding + 'px' : 0)};
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

export const Sponsoring = styled.div`
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
