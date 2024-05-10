import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import PageLabel from './PageLabel'
import PageLink from './PageLink'
import { PageContextValue } from 'core/types'

const StyledLink = styled(PageLink)`
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: ${props => (props.type === 'previous' ? 'flex-start' : 'flex-end')};
    padding: ${spacing()};

    @media ${mq.smallMedium} {
        font-size: ${fontSize('smaller')};
        span {
            display: block;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            width: 100%;
            text-align: center;
        }
    }
    @media ${mq.large} {
        font-size: ${fontSize('medium')};
    }

    &:hover,
    &:focus {
        background: ${props => props.theme.colors.backgroundAlt};
    }
`

const PaginationLink = ({
    page,
    type,
    className = ''
}: {
    page: PageContextValue
    type: string
    className: string
}) => (
    <StyledLink
        page={page}
        className={`pagination__link pagination__${type} ${className}`}
        type={type}
    >
        {type === 'previous' && (
            <span>
                «&nbsp;
                <PageLabel page={page} />
            </span>
        )}
        {type === 'next' && (
            <span>
                <PageLabel page={page} />
                &nbsp;»
            </span>
        )}
    </StyledLink>
)

PaginationLink.propTypes = {
    page: PropTypes.shape({
        id: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired
    }).isRequired,
    type: PropTypes.oneOf(['previous', 'next']).isRequired
}

export default PaginationLink
