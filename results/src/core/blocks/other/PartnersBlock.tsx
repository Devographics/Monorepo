import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'
import { trackClick } from 'core/helpers/trackClick'

const PartnersBlock = ({ data }) => {
    const context = usePageContext()
    const { currentSurvey, currentEdition } = context

    const survey = data?.find(s => s.slug === currentSurvey.slug)
    const edition = survey?.editions?.find(e => e.year === currentEdition.year)
    const partners = edition?.partners

    return partners && partners.length > 0 ? (
        <>
            <Container>
                <Header>
                    <T k="sponsors.with_support_from" />
                </Header>
                <SponsorList className="Sponsor__list">
                    {partners.map(({ name, imageUrl, url, id }) => (
                        <Sponsor className={`Sponsor Sponsor--${id}`} key={name}>
                            <SponsorLogo>
                                <a
                                    onClick={() => {
                                        trackClick(`sponsor_logo_${id}`, { id })
                                    }}
                                    href={url}
                                    title={name}
                                >
                                    <img src={imageUrl} alt={name} />
                                </a>
                            </SponsorLogo>
                            {/* <SponsorDescription>
                                <T k={`sponsors.${id}.description`} />
                            </SponsorDescription> */}
                        </Sponsor>
                    ))}
                </SponsorList>
            </Container>
        </>
    ) : null
}

const Container = styled.div`
    margin-top: ${spacing(2)};
    margin-bottom: ${spacing(2)};
`

const Header = styled.h3`
    text-align: center;
    margin-bottom: ${spacing()};
`

const SponsorList = styled.div`
    @media ${mq.large} {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        column-gap: ${spacing(4)};
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
    }
`

const SponsorLogo = styled.div`
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
        width: 100%;
        max-width: 300px;
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
    font-size: ${fontSize('smallish')};
`

export default PartnersBlock
