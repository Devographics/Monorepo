import React from 'react'
import styled from 'styled-components'
import Link from 'core/components/LocaleLink'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'

const SponsorsBlock = () => {
    const context = usePageContext()
    const { currentEdition } = context

    const sponsors = currentEdition?.sponsors
    return sponsors && sponsors.length > 0 ? (
        <>
            <Container>
                <Header>
                    <T k="sponsors.our_partners" />
                </Header>
                <SponsorList className="Sponsor__list">
                    {sponsors.map(({ name, imageUrl, url, id }) => (
                        <Sponsor className={`Sponsor Sponsor--${id}`} key={name}>
                            <SponsorLogo>
                                <a href={url} title={name}>
                                    <img src={imageUrl} alt={name} />
                                </a>
                            </SponsorLogo>
                            <SponsorDescription>
                                <T k={`sponsors.${id}.description`} />
                            </SponsorDescription>
                        </Sponsor>
                    ))}
                </SponsorList>
            </Container>
            <Support className="Sponsors__Support">
                <Link to="/support">
                    <T k="sponsors.become_partner" />
                </Link>
            </Support>
        </>
    ) : null
}

const Container = styled.div`
    background: ${props => props.theme.colors.backgroundAlt};
    padding: ${spacing(2)};
    margin-top: ${spacing(2)};
`

const Header = styled.h3`
    text-align: center;
    margin-bottom: ${spacing()};
`

const SponsorList = styled.div`
    @media ${mq.large} {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        column-gap: ${spacing(4)};
        row-gap: ${spacing(4)};
        /* display: flex; */
        /* justify-content: center; */
        /* flex-wrap: wrap; */
        /* gap: ${spacing(4)}; */
    }
`

const Sponsor = styled.div`
    @media ${mq.smallMedium} {
        margin-bottom: ${spacing()};
        &:last-child {
            margin: 0;
        }
    }
    @media ${mq.large} {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        /* width: 250px; */
        /* width: 33%; */
    }
`

const SponsorLogo = styled.div`
    height: 80px;

    display: grid;
    place-items: center;

    margin-bottom: ${spacing()};

    &:last-child {
        margin: 0;
    }

    a,
    svg,
    img {
        display: block;
        width: 200px;
    }
    &--designcode {
        width: 50px;
    }
`

const SponsorDescription = styled.div`
    @media ${mq.smallMedium} {
        text-align: center;
    }
`
const Support = styled.div`
    text-align: center;
    margin-top: ${spacing(0.5)};
    margin-bottom: ${spacing(2)};
    font-size: ${fontSize('smallish')};
`

export default SponsorsBlock
