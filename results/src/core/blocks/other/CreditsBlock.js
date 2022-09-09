import React from 'react'
import { spacing, mq } from 'core/theme'
import styled from 'styled-components'
import T from 'core/i18n/T'
import CreditItem from 'core/blocks/other/CreditItem'
import config from 'Config/config.yml'

const CreditsBlock = ({ data }) => {
    const credits = data?.find(s => s.slug === config.slug)?.editions?.find(e => e.year = config.year)?.credits
    return (
        <Credits>
            <Heading>
                <T k="credits.thanks" />
            </Heading>
            <CreditItems>
                {credits.map(c => (
                    <CreditItem key={c.id} {...c} />
                ))}
            </CreditItems>
        </Credits>
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
