import React from 'react'
import Avatar from 'core/components/Avatar'
import { Entity } from '@devographics/types'
import { AmazonIcon, UserIcon } from '@devographics/icons'
import { LabelProps, ServiceDefinition, EntityMetadata } from './types'
import T from 'core/i18n/T'
import { services } from './services'
import Button from 'core/components/Button'
import './People.scss'

export const getSocialLinks = (entity: Entity) => {
    const links: Array<any> = []
    services
        .filter(s => s.service !== 'amazon')
        .forEach(service => {
            const serviceData = entity[service.service as keyof Entity]
            if (serviceData) {
                links.push({ ...service, ...serviceData })
            }
        })
    // const homepageLink = links.find(({ name }) => name === 'homepage')

    // const linksWithoutHomepage = links.filter(({ name }) => name !== 'homepage')
    // const homepageLinkIsSameAsOtherLink = linksWithoutHomepage.some(
    //     ({ url }) => url === homepageLink?.url
    // )
    // if (homepageLinkIsSameAsOtherLink) {
    //     homepageLink.url = null
    // }
    return links
}

export const PeopleIcon = ({ entity }: LabelProps) =>
    entity?.avatar?.url ? <Avatar entity={entity} size={30} /> : <UserIcon />

export const PeopleModal = ({ entity }: LabelProps) => {
    const { alias, name, author } = entity
    return (
        <div>
            <h3 className="item-name">{alias ? `${alias} (${name})` : name}</h3>
            {author && <h4 className="item-author">{author}</h4>}
            {entity.descriptionHtml && (
                <div className="item-description">
                    <div dangerouslySetInnerHTML={{ __html: entity.descriptionHtml }} />
                </div>
            )}
            <ul className="item-links">
                <ItemLinks entity={entity} />
            </ul>
            {entity.amazon && <AmazonButton entity={entity} />}
        </div>
    )
}

export const ItemLinks = ({ entity }: { entity: Entity }) => {
    const links = getSocialLinks(entity)
    return (
        <ul className="item-links">
            {links.map(({ service, url, icon }, index) => (
                <LinkItem key={service} service={service} url={url} icon={icon} />
            ))}
        </ul>
    )
}

export const LinkItem = ({
    service,
    url,
    icon: Icon
}: {
    service: string
    url: string
    icon: ServiceDefinition['icon']
}) => (
    <li className="item-links-item">
        <a className="item-links-item-link" href={url} target="_blank" rel="noreferrer">
            {Icon && <Icon size="small" labelId={`blocks.entity.${service}_link`} />}
            <T k={`blocks.entity.${service}_link`} />
        </a>
    </li>
)

const AmazonButton = ({ entity }: { entity: EntityMetadata }) => {
    return (
        <div className="entity-amazon">
            <Button as="a" href={entity.amazon.url} target="_blank" rel="noopener noreferrer">
                <AmazonIcon size="small" labelId={`blocks.entity.amazon_link`} />
                <T k="blocks.entity.amazon_link" />
            </Button>

            <T className="entity-amazon-affiliate-notice" k="blocks.entity.amazon_link.affiliate" />
        </div>
    )
}
