import React from 'react'
import styled from 'styled-components'
import Pagination from 'core/pages/Pagination'
import { Sidebar } from 'core/components/sidebar'
import { mq, spacing, screenReadersOnlyMixin } from 'core/theme'
import colors from 'core/theme/colors'
import classNames from 'classnames'
import Hamburger from 'core/components/Hamburger'
import { useI18n } from '@devographics/react-i18n'
import SurveyBanner from 'core/components/SurveyBanner'

const MainLayout = ({
    context,
    showPagination,
    showSidebar,
    toggleSidebar,
    closeSidebar,
    children
}: {
    context: any
    showPagination?: boolean
    showSidebar?: boolean
    toggleSidebar?: () => void
    closeSidebar: () => void
    children?: React.ReactNode
}) => {
    const { getString } = useI18n()
    return (
        <>
            <Skip href="#page-main">{getString('general.skip_to_content')?.t}</Skip>
            <MainLayout_>
                <SurveyBanner />
                <Page showSidebar={showSidebar}>
                    <Header_>
                        <MenuToggle
                            onClick={toggleSidebar}
                            aria-haspopup="menu"
                            aria-expanded={showSidebar}
                        >
                            <ScreenReadersHint>
                                {getString('general.open_nav')?.t}
                            </ScreenReadersHint>
                            <Hamburger />
                        </MenuToggle>
                        <Sidebar showSidebar={showSidebar} closeSidebar={closeSidebar} />
                    </Header_>
                    <PageContent className="PageContent" id="pageContent">
                        <PaginationWrapper>
                            {showPagination && <Pagination /*position="top"*/ />}
                        </PaginationWrapper>
                        <PageMain id="page-main">
                            {/* <PageMetaDebug /> */}
                            {children}
                        </PageMain>
                    </PageContent>
                </Page>
            </MainLayout_>
        </>
    )
}

const MainLayout_ = styled.div`
    /* display: flex; */
    /* flex-direction: column; */
    display: grid;
    grid-template-rows: min-content minmax(0, 1fr);
    grid-template-areas: 'banner' 'content';
    height: 100vh;
    @media ${mq.large} {
        overflow: hidden;
    }
`

const Header_ = styled.header``

const ScreenReadersHint = styled.span`
    ${screenReadersOnlyMixin}
`

const Skip = styled.a`
    display: block;
    padding: 1rem 1rem;

    position: absolute;
    top: -900px;
    left: -900px;

    &:focus {
        display: inline-block;
        position: static !important;
        top: 0 !important;
        left: 0 !important;
        border: 2px solid white;
    }
`

const PaginationWrapper = styled.div`
    @media ${mq.smallMedium} {
        padding-left: 5rem;
        border-bottom: ${({ theme }) => theme.separationBorder};
    }
`

const MenuToggle = styled.button`
    display: block;
    background-color: transparent;
    outline: none;
    border: none;

    position: absolute;
    top: 0;
    left: 0;

    cursor: pointer;

    padding: 0.825rem 1rem 0.5rem 1rem;

    width: 5rem;
    height: 3.71rem;

    box-sizing: border-box;

    svg {
        width: 2rem;
        height: auto;
    }

    @media ${mq.large} {
        display: none;
    }

    &:focus {
        border: 2px solid ${colors.greenLight};
        outline: 5px auto -webkit-focus-ring-color;
    }

    &:hover,
    &:focus {
        background: ${({ theme }) => theme.colors.backgroundAlt};
    }
`

const PageContent = styled.div`
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    /* height: 100vh; */
    overscroll-behavior: contain;
`

const Page = styled.div`
    grid-area: content;
    @media ${mq.large} {
        display: grid;
        grid-template-columns: ${({ theme }) => theme.dimensions.sidebar.width}px calc(
                100% - ${({ theme }) => theme.dimensions.sidebar.width}px
            );
    }

    @media ${mq.smallMedium} {
        grid-template-columns: 5rem auto;
    }

    /* min-height: 100vh; */
    position: relative;
`

const PageMain = styled.div`
    flex-grow: 1;
    /* overflow-x: hidden; */
    overflow-y: visible;

    @media ${mq.smallMedium} {
        padding: ${spacing()};
    }

    @media ${mq.large} {
        padding: ${spacing(3)};
    }
`

export default MainLayout
