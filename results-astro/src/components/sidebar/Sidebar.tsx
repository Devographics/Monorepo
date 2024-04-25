import React from 'react'
import { usePageContext } from '../layouts/PageContext'
import { useI18n } from '@devographics/react-i18n'
import { screenReadersOnly } from '@/lib/theme'
import { getSiteTitle } from '@/lib/sitemap'
import { Nav } from './Nav'
// import styled from 'styled-components'
// import Link from 'core/components/LocaleLink'
// import ShareSite from 'core/share/ShareSite'
// import { useI18n } from '@devographics/react-i18n'
// import { mq, color, screenReadersOnlyMixin } from 'core/theme'
// import colors from 'core/theme/colors'
// import { Nav } from './Nav'
// import SidebarLogo from 'Logo/SidebarLogo'
// import { usePageContext } from 'core/helpers/pageContext'

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
            <line x1=".5" y1=".5" x2="23.5" y2="23.5" />
            <line x1="23.5" y1=".5" x2=".5" y2="23.5" />
        </g>
    </svg>
)

export const Sidebar = ({
    showSidebar,
    closeSidebar
}: {
    showSidebar?: boolean
    closeSidebar: () => void
}) => {
    const { translate } = useI18n()
    const pageContext = usePageContext()

    return (
        <div id="sidebar" className="Sidebar">
            <button
                onClick={closeSidebar}
                aria-haspopup="menu"
                aria-expanded={showSidebar}
            >
                <CloseIcon />
                <span className={screenReadersOnly}>{translate('general.close_nav').t}</span>
            </button>
            <span className={screenReadersOnly}>{getSiteTitle({ edition: pageContext.edition })}</span>
            <Nav closeSidebar={closeSidebar} />
        </div>
    )
}