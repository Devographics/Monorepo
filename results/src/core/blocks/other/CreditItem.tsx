import React from 'react'
import { spacing, fontSize } from 'core/theme'
import styled from 'styled-components'
import T from 'core/i18n/T'
import Avatar from 'core/components/Avatar'
import { Credit } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'
import { usePageContext } from 'core/helpers/pageContext'

const CreditItem = ({ entity, role, labelId }: Credit & { labelId?: string }) => {
    const { getString } = useI18n()
    const { currentEdition } = usePageContext()

    if (!entity) {
        return null
    }
    const { name, homepage, twitter, company, alias } = entity
    const namei18nLabel = getString(`conclusion.${currentEdition.id}.${entity.id}.name`)?.t
    const nameEntityLabel = alias ? `${name} (${alias})` : name
    const nameLabel = namei18nLabel || nameEntityLabel
    return (
        <CreditItemDiv>
            {entity?.avatar?.url && (
                <CreditAvatar_>
                    <Avatar entity={entity} />
                </CreditAvatar_>
            )}
            <Details>
                <Name>
                    <a href={homepage?.url || twitter?.url}>{nameLabel}</a>
                </Name>
                {!!company && (
                    <Company>
                        {company.homepage?.url ? (
                            <a href={company.homepage?.url}>{company.name}</a>
                        ) : (
                            company.name
                        )}
                    </Company>
                )}
                {/* <Twitter>
                    <a href={`https://twitter.com/${twitterName}`}>@{twitterName}</a>
                </Twitter> */}
                <Role>
                    <T k={labelId ?? `credits.${role}`} html={true} md={true} />
                </Role>
            </Details>
        </CreditItemDiv>
    )
}

export default CreditItem

const CreditItemDiv = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing()};
`

const CreditAvatar_ = styled.div``

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
