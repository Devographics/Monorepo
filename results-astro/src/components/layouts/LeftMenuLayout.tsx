import React, { useState } from 'react'
import Pagination from "@/components/ui/DummyReact" //'core/pages/Pagination'
import { Sidebar } from "@/components/sidebar/Sidebar"
// import classNames from 'classnames'
import { useI18n } from '@devographics/react-i18n'
import Hamburger from '@/components/ui/Hamburger'
import { screenReadersOnly } from '@/lib/theme/mixins'
import { T } from '../i18n/T'
import { tokensMap } from "./LeftMenuLayout.tokens"
// import SurveyBanner from 'core/components/SurveyBanner'

function useSidebar() {
    const [showSidebar, setShowSidebar] = useState<boolean>(false)
    function toggleSidebar() {
        setShowSidebar(sb => !sb)
    }
    function closeSidebar() {
        setShowSidebar(false)
    }
    return [showSidebar, { closeSidebar, toggleSidebar }] as const
}

const LeftMenuLayout = ({
    showPagination,
    children
}: {
    showPagination?: boolean
    children?: React.ReactNode
}) => {
    const { getString } = useI18n()
    const [showSidebar, { toggleSidebar, closeSidebar }] = useSidebar()
    return (
        <>
            <a href="#page-main"><T token={tokensMap["general.skip_to_content"]} /></a>
            {/* <SurveyBanner /> */}
            <div>
                <header>
                    <T
                        token={tokensMap["general.{{editionId}}.results_intro"]}
                        className={screenReadersOnly} />
                    <button
                        onClick={toggleSidebar}
                        aria-haspopup="menu"
                        aria-expanded={showSidebar}
                    >
                        <T
                            token={tokensMap["general.open_nav"]}
                            className={screenReadersOnly} />
                        <Hamburger />
                    </button>
                    <Sidebar showSidebar={showSidebar} closeSidebar={closeSidebar} />
                </header>
                <div className="PageContent">
                    <div>
                        {showPagination && <Pagination /*position="top"*/ />}
                    </div>
                    <div id="page-main">
                        {/* <PageMetaDebug /> */}
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}


export default LeftMenuLayout
