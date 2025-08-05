import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import PageLabel from './PageLabel'
import PageLink from './PageLink'
import { PageContextValue } from 'core/types'
import './PaginationLink.scss'
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
        className={`pagination-link pagination__link pagination__${type} ${className}`}
        type={type}
    >
        {type === 'previous' && (
            <span className="pagination-link-inner pagination-link-inner-previous">
                <span className="pagination-link-arrow">«&nbsp;</span>
                <PageLabel page={page} />
            </span>
        )}
        {type === 'next' && (
            <span className="pagination-link-inner pagination-link-inner-next">
                <PageLabel page={page} />
                <span className="pagination-link-arrow">&nbsp;»</span>
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
