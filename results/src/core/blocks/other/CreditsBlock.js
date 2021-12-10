import React from 'react'
import { spacing, mq, fontSize } from 'core/theme'
import styled from 'styled-components'
import T from 'core/i18n/T'
import credits from 'Config/credits.yml'
import { useEntities } from 'core/entities/entitiesContext'

const CreditsBlock = ({ survey }) => {
    return (
        <Credits>
            <Heading>
                <T k="credits.thanks" />
            </Heading>
            <CreditItems>
                {credits.map(c => (
                    <SurveyCreditItem key={c.id} {...c} />
                ))}
            </CreditItems>
        </Credits>
    )
}

const SurveyCreditItem = ({ id, role }) => {
    const { getEntity } = useEntities()
    const entity = getEntity(id)
    if (!entity) {
        return null
    }
    const { name, twitterName, twitter } = entity
    return (
        <CreditItem>
            <Avatar href={`https://twitter.com/${twitterName}`}>
                <img src={twitter?.avatarUrl} />
            </Avatar>
            <Details>
                <Name>{name}</Name>
                <Twitter>
                    <a href={`https://twitter.com/${twitterName}`}>@{twitterName}</a>
                </Twitter>
                <Role>
                    <T k={`credits.${role}`} />
                </Role>
            </Details>
        </CreditItem>
    )
}

export default CreditsBlock

const Credits = styled.div`
    max-width: 700px;
    margin: 0 auto;
    margin-bottom: ${spacing(2)};
`

const Heading = styled.h3`
    text-align: center;
`

const CreditItems = styled.div`
    column-gap: ${spacing(2)};
    row-gap: ${spacing(2)};
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    @media ${mq.small} {
        grid-template-columns: repeat(1, 1fr);
    }
`

const CreditItem = styled.div`
    display: flex;
`

const Avatar = styled.a`
    margin-right: ${spacing(0.5)};
    overflow: hidden;
    border-radius: 100%;
    height: 60px;
    width: 60px;
    img {
        display: block;
        height: 100%;
        width: 100%;
    }
`

const Details = styled.div``

const Name = styled.h4`
    font-size: ${fontSize('large')};
    margin-bottom: 0px;
`

const Twitter = styled.div`
    font-size: ${fontSize('small')};
`

const Role = styled.div`
    font-size: ${fontSize('small')};
`
