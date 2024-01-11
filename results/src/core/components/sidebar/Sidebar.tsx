import React from 'react'
import styled from 'styled-components'
import Link from 'core/components/LocaleLink'
import ShareSite from 'core/share/ShareSite'
import { useI18n } from '@devographics/react-i18n'
import { mq, color, screenReadersOnlyMixin } from 'core/theme'
import colors from 'core/theme/colors'
import { Nav } from './Nav'
import SidebarLogo from 'Logo/SidebarLogo'
import { usePageContext } from 'core/helpers/pageContext'
import { getSiteTitle } from 'core/helpers/pageHelpers'

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
        <SidebarContainer id="sidebar" show={showSidebar} className="Sidebar">
            <SidebarCloseButton
                onClick={closeSidebar}
                aria-haspopup="menu"
                aria-expanded={showSidebar}
            >
                <CloseIcon />
                <ScreenReadersHint>{translate('general.close_nav')}</ScreenReadersHint>
            </SidebarCloseButton>

            <SidebarScreenReadersTitle>{getSiteTitle({ pageContext })}</SidebarScreenReadersTitle>
            <SidebarHeader>
                <SidebarLogoLink to="/">
                    <SidebarLogo />
                    <ScreenReadersHint>{translate('general.back_to_intro')}</ScreenReadersHint>
                </SidebarLogoLink>
            </SidebarHeader>
            <Nav closeSidebar={closeSidebar} />
            <ShareSite />
        </SidebarContainer>
    )
}

const SidebarContainer = styled.div`
    border-right: ${props => props.theme.separationBorder};
    display: grid;
    grid-template-rows: auto 1fr auto;

    @media ${mq.large} {
        width: ${({ theme }) => theme.dimensions.sidebar.width}px;
        height: 100vh;
        position: fixed;
    }

    @media ${mq.smallMedium} {
        width: 100%;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: ${color('background')};
        z-index: 1000;
        text-align: center;
        position: fixed;
        display: ${props => (props.show ? 'grid' : 'none')};
    }
`

const SidebarScreenReadersTitle = styled.h1`
    ${screenReadersOnlyMixin}
`

const ScreenReadersHint = styled.span`
    ${screenReadersOnlyMixin}
`

const SidebarHeader = styled.div`
    display: grid;
    grid-template-columns: 0 1fr 0;
    grid-template-areas: 'left logo right';
    border-bottom: ${props => props.theme.separationBorder};

    @media ${mq.smallMedium} {
        grid-template-columns: 50px 1fr 50px;
    }
`

const SidebarLogoLink = styled(Link)`
    grid-area: logo;
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
        max-height: 76px;
    }

    &:hover {
        text-decoration: none;
    }
`

const SidebarCloseButton = styled.button`
    grid-area: right;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: none;
    cursor: pointer;
    border: none;
    position: absolute;

    box-sizing: border-box;
    width: calc(calc(100vw - 270px) / 2);
    height: 68px;

    svg {
        stroke: ${color('link')};
    }

    @media ${mq.large} {
        display: none;
    }

    &:hover,
    &:focus {
        background-color: ${colors.greyDarkish};
    }
`
