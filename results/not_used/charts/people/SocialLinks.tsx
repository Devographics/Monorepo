import React from 'react'
import styled from 'styled-components'
import { spacing, mq, fontSize } from 'core/theme'

export const getSocialLinks = (entity, services) => {
    const links = services.map(service => ({ ...service, url: entity?.[service.name]?.url }))
    const homepageLink = links.find(({ name }) => name === 'homepage')

    const linksWithoutHomepage = links.filter(({ name }) => name !== 'homepage')
    const homepageLinkIsSameAsOtherLink = linksWithoutHomepage.some(
        ({ url }) => url === homepageLink?.url
    )
    if (homepageLinkIsSameAsOtherLink) {
        homepageLink.url = null
    }
    return links
}

const SocialLinks = ({ entity, services }) => {
    return (
        <SocialLinks_>
            {getSocialLinks(entity, services).map(({ name, url, icon }, index) =>
                url ? (
                    <LinkItem key={name} index={index} name={name} url={url} icon={icon} />
                ) : (
                    <EmptyItem_ key={name} />
                )
            )}
        </SocialLinks_>
    )
}

const LinkItem = ({ name, url, icon: Icon, index }) => (
    <Link_ href={url} target="_blank" rel="noreferrer">
        {Icon ? <Icon size="small" labelId={`blocks.entity.${name}_link`} /> : name}
    </Link_>
)

const Link_ = styled.a`
    padding: ${spacing(0.5)};
`

const EmptyItem_ = styled.div`
    height: 8px;
    width: 8px;
    border-radius: 100%;
    background: ${({ theme }) => theme.colors.background};
`

const SocialLinks_ = styled.div`
    /* display: flex; */
    /* gap: ${spacing()}; */
    /* align-items: center; */
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    place-items: center;
`

export default SocialLinks
