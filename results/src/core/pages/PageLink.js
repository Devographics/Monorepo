import React from 'react'
import PropTypes from 'prop-types'
import Link from 'core/components/LocaleLink'

const PageLink = ({ page, children, className, activeClassName, onClick }) => (
    <Link to={page.path} className={className} activeClassName={activeClassName} onClick={onClick}>
        <span>{children}</span>
    </Link>
)

PageLink.propTypes = {
    page: PropTypes.shape({
        path: PropTypes.string.isRequired,
    }).isRequired,
}

export default PageLink
