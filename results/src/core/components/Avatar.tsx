import React from 'react'
import { spacing, mq, fontSize } from 'core/theme'
import styled from 'styled-components'

const getUrl = entity => entity?.homepage?.url || entity?.twitter?.url

const Avatar = ({ entity, size = 60 }) => (
    <Avatar_ href={getUrl(entity)} size={size}>
        <img src={`https://assets.devographics.com/avatars/${entity.id}.jpg`} alt={entity.name} />
    </Avatar_>
)

const Avatar_ = styled.a`
    display: block;
    /* margin-right: ${spacing(0.5)}; */
    /* flex-shrink: 0; */
    overflow: hidden;
    border-radius: 100%;
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
    img {
        display: block;
        height: 100%;
        width: 100%;
    }
`

export default Avatar
