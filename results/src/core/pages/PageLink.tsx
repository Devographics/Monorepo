import React from 'react'
import Link from 'core/components/LocaleLink'
import { PageDef } from 'core/types'

const getPath = (page: PageDef, parentPage: PageDef) =>
    parentPage ? parentPage.path + page.path : page.path

const PageLink = ({
    parentPage,
    page,
    children,
    className,
    activeClassName,
    onClick
}: {
    parentPage: PageDef
    page: PageDef
    children: React.ReactNode
    className: string
    activeClassName: string
    onClick: any
}) => (
    <Link
        to={getPath(page, parentPage)}
        className={className}
        activeClassName={activeClassName}
        onClick={onClick}
    >
        <span className="page-link-inner">{children}</span>
    </Link>
)

export default PageLink
