import React from 'react'
import PropTypes from 'prop-types'
import Link from 'core/components/LocaleLink'

const getPath = (page, parentPage) => (parentPage ? parentPage.path + page.path : page.path)

const PageLink = ({ parentPage, page, children, className, activeClassName, onClick }) => (
    <Link
        to={getPath(page, parentPage)}
        className={className}
        activeClassName={activeClassName}
        onClick={onClick}
    >
        <span>{children}</span>
    </Link>
)

export default PageLink
