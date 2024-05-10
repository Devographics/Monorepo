import React from 'react'
import styled from 'styled-components'
import { spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import Tooltip from 'core/components/Tooltip'
import { SponsorOrder } from 'core/types/sponsors'

const SponsorCredit = ({ sponsor }: { sponsor: SponsorOrder }) => {
    const avatarUrl = sponsor.twitterData?.profile_image_url
    const username = sponsor.twitterData?.username || sponsor?.twitterName
    const name = sponsor.twitterData?.name
    const amount = sponsor.amount
    const link = `https://twitter.com/${username}`
    return (
        <div>
            <Tooltip
                trigger={
                    <SponsorLink href={link}>
                        <ImageWrapper>
                            <Image src={avatarUrl} alt="" />
                        </ImageWrapper>
                        <Username>
                            <UsernameInner>@{username}</UsernameInner>
                        </Username>
                    </SponsorLink>
                }
                contents={
                    <T k="sponsor.sponsored_by" values={{ username, name, amount }} md={true} />
                }
            />
        </div>
    )
}

const Username = styled.div`
    transition: max-width ease-in 300ms;
    max-width: 0;
    overflow: hidden;
`

const UsernameInner = styled.div`
    padding: 3px 8px;
    font-size: ${fontSize('small')};
`

const ImageWrapper = styled.div`
    border: 2px solid ${({ theme }) => theme.colors.borderAlt2};
    border-radius: 100%;
    height: 30px;
    width: 30px;
    overflow: hidden;
    margin: -2px -2px -2px -2px;
`

const SponsorLink = styled.a`
    margin-left: ${spacing(0.5)};
    border: 2px solid ${({ theme }) => theme.colors.borderAlt2};
    background: ${({ theme }) => theme.colors.backgroundAlt};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    height: 30px;
    &:hover {
        border-color: ${({ theme }) => theme.colors.link};
    }
    &:hover ${Username} {
        max-width: 300px;
    }
    &:hover ${ImageWrapper} {
        border-color: ${({ theme }) => theme.colors.link};
    }
`

const Image = styled.img`
    display: block;
    height: 100%;
    width: 100%;
`

export default SponsorCredit
