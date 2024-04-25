import React, { useState } from 'react'
import Pagination from "@/components/ui/DummyReact" //'core/pages/Pagination'
import { Sidebar } from "@/components/sidebar/Sidebar"
// import classNames from 'classnames'
import { useI18n } from '@devographics/react-i18n'
import Hamburger from '@/components/ui/Hamburger'
import { screenReadersOnly } from '@/lib/theme/mixins'
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
            <a href="#page-main">{getString('general.skip_to_content')?.t}</a>
            {/* <SurveyBanner /> */}
            <div>
                <header>
                    <button
                        onClick={toggleSidebar}
                        aria-haspopup="menu"
                        aria-expanded={showSidebar}
                    >
                        <span className={screenReadersOnly}>{getString('general.open_nav')?.t}</span>
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
