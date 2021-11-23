import React from 'react'
import styled, { css } from 'styled-components'
import sitemap from 'Config/sitemap.yml'
import { mq, fancyLinkMixin, spacing } from 'core/theme'
import { usePageContext } from 'core/helpers/pageContext'
import PageLink from 'core/pages/PageLink'
import LanguageSwitcher from 'core/i18n/LanguageSwitcher'
import { getPageLabelKey } from 'core/helpers/pageHelpers'
import T from 'core/i18n/T'

const filteredNav = sitemap.contents.filter((page) => !page.is_hidden)

const StyledPageLink = styled(PageLink)`
    display: flex;
    white-space: nowrap;
    margin: 0 0 ${spacing(0.33)} 0;
    font-size: ${(props) =>
        props.depth > 0
            ? props.theme.typography.size.smallish
            : props.theme.typography.size.medium};
    font-weight: ${(props) => (props.depth === 0 ? 800 : 400)};

    /* & > span {

        display: inline-block;
    } */

    @media ${mq.smallMedium} {
        margin-bottom: ${spacing(0.5)};
        display: block;
    }

    @media ${mq.large} {
        & > span {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            max-width: 100%;
            display: inline-block;
        }
        margin-left: ${(props) => (props.depth > 0 ? spacing() : 0)};
        ${(props) => {
            if (props.isHidden) {
                return css`
                    display: none;
                `
            }
        }}
    }

    &._is-active {
        span span::before {
            content: '> ';
        }

        @media ${mq.smallMedium} {
            span span::after {
                content: ' <';
            }
        }
    }

    ${(props) =>
        fancyLinkMixin({
            color: props.depth === 0 ? props.theme.colors.link : props.theme.colors.text,
            activeColor: props.theme.colors.linkActive,
        })}
`

const NavItem = ({ page, currentPath, closeSidebar, isHidden = false, depth = 0 }) => {
    const isActive = currentPath.indexOf(page.path) !== -1
    const hasChildren = page.children && page.children.length > 0
    const displayChildren = hasChildren > 0 && isActive

    return (
        <>
            <StyledPageLink
                activeClassName="_is-active"
                onClick={closeSidebar}
                page={page}
                depth={depth}
                isHidden={isHidden}
            >
                <T k={getPageLabelKey(page)} />
            </StyledPageLink>
            {hasChildren && (
                <>
                    {page.children.map((childPage) => (
                        <NavItem
                            key={childPage.id}
                            page={childPage}
                            closeSidebar={closeSidebar}
                            currentPath={currentPath}
                            depth={depth + 1}
                            isHidden={!displayChildren}
                        />
                    ))}
                </>
            )}
        </>
    )
}

export const Nav = ({ closeSidebar }) => {
    const context = usePageContext()

    return (
        <NavContainer>
            <LanguageSwitcherWrapper>
                <LanguageSwitcher />
            </LanguageSwitcherWrapper>
            {filteredNav.map((page, i) => (
                <NavItem
                    key={i}
                    page={page}
                    currentPath={context.currentPath}
                    closeSidebar={closeSidebar}
                />
            ))}
        </NavContainer>
    )
}

const NavContainer = styled.div`
    flex-grow: 1;
    /* display: flex; */
    /* flex-direction: column; */
    padding: ${spacing(1.5)} ${spacing()};
    overflow-y: auto;

    @media ${mq.smallMedium} {
        align-items: center;
        overflow-y: scroll;
    }
`

const LanguageSwitcherWrapper = styled.div`
    position: relative;
    width: 100%;
`
