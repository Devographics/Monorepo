import React, { useState } from 'react'
import Pagination from "@/components/ui/DummyReact" //'core/pages/Pagination'
import { Sidebar } from "@/components/sidebar/Sidebar"
import Hamburger from '@/components/ui/Hamburger'
import { screenReadersOnly } from '@/lib/theme/mixins'
import { teapot } from '@/lib/i18n/teapot'

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

/**
 * TODO: in the future this should be automatically generated based on the "T"
 * components defined by the component
 * This is an intermediate step to keep a relatively clean setup
 */
export const { T, tokens } = teapot([
    "general.skip_to_content",
    "general.open_nav",
    // Not really used but just an experiment
    // The server render takes care of selection the right translation
    // so <T token="{{surveyId}}.test" /> will become "This is the State of HTML survey" for instance
    // general.css2023.results_intro
    // TODO: one difficulty is that we may forget what editionId is? it can be confusing to match the token expr and actual tokens
    "general.{{editionId}}.results_intro"
] as const)

const LeftMenuLayout = ({
    showPagination,
    children
}: {
    showPagination?: boolean
    children?: React.ReactNode
}) => {
    const [showSidebar, { toggleSidebar, closeSidebar }] = useSidebar()
    return (
        <>
            <a href="#page-main"><T token={"general.skip_to_content"} /></a>
            {/* <SurveyBanner /> */}
            <div>
                <header>
                    <T
                        token={"general.{{editionId}}.results_intro"}
                        className={screenReadersOnly} />
                    <button
                        onClick={toggleSidebar}
                        aria-haspopup="menu"
                        aria-expanded={showSidebar}
                    >
                        <T
                            token={"general.open_nav"}
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
