import React, { memo, useState, useCallback } from 'react'
import styled, { useTheme, keyframes } from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import AwardBlock from 'core/blocks/awards/AwardBlock'

const AwardsBlock = ({ block }) => (
    <Wrapper>
        {block.awards.map(award => (
            <AwardBlock key={award.id} block={award} />
        ))}
    </Wrapper>
)

const Wrapper = styled.div`
    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: ${spacing(6)};
        row-gap: ${spacing(4)};
    }
`

export default AwardsBlock
