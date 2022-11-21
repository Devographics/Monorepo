import React from 'react'
import { spacing, mq, fontSize } from 'core/theme'
import styled from 'styled-components'
import T from 'core/i18n/T'

const CreditItem = ({ entity, role, labelId }) => {
    if (!entity) {
        return null
    }
    const { name, twitterName, twitter, company } = entity
    return (
        <CreditItemDiv>
            <Avatar href={`https://twitter.com/${twitterName}`}>
                <img src={twitter?.avatarUrl} alt={name} />
            </Avatar>
            <Details>
                <Name>
                    <a href={`https://twitter.com/${twitterName}`}>{name}</a>
                </Name>
                {company && (
                    <Company>
                        <a href={company.homepage.url}>{company.name}</a>
                    </Company>
                )}
                {/* <Twitter>
                    <a href={`https://twitter.com/${twitterName}`}>@{twitterName}</a>
                </Twitter> */}
                <Role>
                    <T k={labelId ?? `credits.${role}`} />
                </Role>
            </Details>
        </CreditItemDiv>
    )
}

export default CreditItem

const CreditItemDiv = styled.div`
    display: flex;
    align-items: center;
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

const Details = styled.div`
    position: relative;
    /* top: -5px; */
`

const Name = styled.h4`
    font-size: ${fontSize('large')};
    margin-bottom: 0px;
    line-height: 1.3;
`

const Twitter = styled.div`
    font-size: ${fontSize('small')};
`

const Company = styled.div`
    font-size: ${fontSize('small')};
`

const Role = styled.div`
    font-size: ${fontSize('small')};
`
