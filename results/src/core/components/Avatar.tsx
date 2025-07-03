import React from 'react'
import { spacing, mq, fontSize } from 'core/theme'
import styled from 'styled-components'
import './Avatar.scss'

const getUrl = entity => entity?.homepage?.url || entity?.twitter?.url

export const Avatar = ({ entity, size = 60 }) => (
    <a className="avatar avatar-link" href={getUrl(entity)} style={{ '--size': size }}>
        <img src={entity?.avatar?.url} alt={entity.name} />
    </a>
)

export const AvatarNotLink = ({ entity, size = 60 }) => (
    <span className="avatar" style={{ '--size': size }}>
        <img src={entity?.avatar?.url} alt={entity.name} />
    </span>
)

export default Avatar
