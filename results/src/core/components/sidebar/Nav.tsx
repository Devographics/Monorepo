import React, { useContext } from 'react'
import { useMatch } from '@reach/router'
import get from 'lodash/get'
import styled, { css } from 'styled-components'
import sitemap from 'Config/raw_sitemap.yml'
import { mq, fancyLinkMixin, spacing, fontSize, fontWeight } from 'core/theme'
import { usePageContext } from 'core/helpers/pageContext'
import PageLink from 'core/pages/PageLink'
import LanguageSwitcher, { LanguageSwitcherContents } from 'core/i18n/LanguageSwitcher'
import { getPageLabel, getPageLabelKey } from 'core/helpers/pageHelpers'
import T from 'core/i18n/T'
import { PageContextValue } from 'core/types'
import { getBlockTitle, getBlockTitleKey } from 'core/helpers/blockHelpers'
import { useI18n } from '@devographics/react-i18n'
import { useEntities } from 'core/helpers/entities'
import Avatar, { AvatarNotLink } from '../Avatar'
import './Nav.scss'

interface PageConfig {
    is_hidden?: boolean
    id: string
}
const filteredNav =
    (sitemap as Array<PageConfig> | undefined)?.filter(page => !page.is_hidden) ?? []

const getStyledLink = component => styled(component)`
    display: flex;
    white-space: nowrap;
    margin: 0 0 ${spacing(0.33)} 0;
    font-size: ${props =>
        props.depth > 0
            ? props.theme.typography.size.smallish
            : props.theme.typography.size.medium};
    font-weight: ${props => (props.depth === 0 ? fontWeight('bold') : fontWeight('medium'))};

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
        margin-left: ${props => (props.depth > 0 ? spacing() : 0)};
        ${props => {
            if (props.isHidden) {
                return css`
                    display: none;
                `
            }
        }}
    }

    &._is-active {
        span .page-link-inner::before {
            content: '> ';
        }

        @media ${mq.smallMedium} {
            span .page-link-inner::after {
                content: ' <';
            }
        }
    }

    ${props =>
        fancyLinkMixin({
            color: props.depth === 0 ? props.theme.colors.link : props.theme.colors.text,
            // activeColor: props.theme.colors.linkActive,
            activeColor: props.theme.colors.text
        })}
`

const StyledPageLink = getStyledLink(PageLink)
const StyledInternalLink = getStyledLink('a')

const excludedTemplatesAndIds = [
    'survey_intro',
    'sponsors',
    'credits',
    'survey_newsletter',
    'survey_translators',
    'page_introduction',
    'hint',
    'recommended_resources',
    'picks',
    'conclusion',
    'conclusion_newsletter',
    'midpage_resource',
    'figure'
]

const NavItem = ({
    page,
    parentPage,
    currentPath,
    closeSidebar,
    isHidden = false,
    depth = 0
}: {
    page: PageContextValue
    parentPage?: PageContextValue
    currentPath: string
    closeSidebar: () => void
    isHidden?: boolean
    depth?: number
}) => {
    const { getString } = useI18n()
    const pageContext = usePageContext()

    const isActive = currentPath.indexOf(page.path) !== -1
    const hasChildren = page.children && page.children.length > 0
    const displayChildren = hasChildren > 0 && isActive

    const match = useMatch(`${get(pageContext, 'locale.id')}${parentPage?.path ?? ''}${page.path}`)

    const currentPageBlocks = pageContext.blocks
        .map(b => b.variants[0])
        .filter(
            b =>
                !(
                    excludedTemplatesAndIds.includes(b.id) ||
                    excludedTemplatesAndIds.includes(b.template) ||
                    b.hidden
                )
        )

    const { key, label } = getPageLabel({ pageContext: page, getString })
    const imageUrl = page?.variables?.imageUrl
    return (
        <>
            <StyledPageLink
                className={match ? '_is-active' : undefined}
                onClick={closeSidebar}
                page={page}
                depth={depth}
                isHidden={isHidden}
                parentPage={parentPage}
            >
                <span className="page-link-inner" data-key={key}>
                    <span>{label}</span>
                    {imageUrl && (
                        <AvatarNotLink
                            size={24}
                            entity={{ name: label, avatar: { url: imageUrl } }}
                        />
                    )}
                </span>
            </StyledPageLink>
            {match && currentPageBlocks.length > 1 && (
                <InternalLinks_ className={`internal-links-depth-${depth}`}>
                    {currentPageBlocks.map(block => (
                        <BlockItem
                            key={block.id}
                            block={block}
                            page={page}
                            closeSidebar={closeSidebar}
                        />
                    ))}
                </InternalLinks_>
            )}
            {hasChildren && (
                <>
                    {page.children.map(childPage => (
                        <NavItem
                            key={childPage.id}
                            parentPage={page}
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

const BlockItem = ({ block, closeSidebar, page }) => {
    const pageContext = usePageContext()
    const { getString } = useI18n()
    const entities = useEntities()
    const { key, label } = getBlockTitle({
        block,
        pageContext,
        getString,
        entities,
        useShortLabel: true
    })
    const emojiKey = `${key}.emoji`
    const hasEmoji = !getString(emojiKey).missing
    return (
        <InternalLinkWrapper_>
            <InternalLink_
                className="InternalLink"
                href={`#${block.id}`}
                onClick={closeSidebar}
                page={page}
                data-key={key}
            >
                {hasEmoji && (
                    <span className="question-emoji">
                        <T k={emojiKey} />{' '}
                    </span>
                )}
                {label}
                {/* <T k={getBlockTitleKey({ block: { ...block, sectionId: page.id } })} /> */}
            </InternalLink_>
        </InternalLinkWrapper_>
    )
}

const InternalLinks_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing(0.5)};
    margin-bottom: ${spacing(0.5)};
`

const InternalLinkWrapper_ = styled.div`
    @media ${mq.large} {
        .internal-links-depth-0 & {
            margin-left: ${spacing(1)};
        }
        .internal-links-depth-1 & {
            margin-left: ${spacing(1.9)};
        }
    }
`
const InternalLink_ = styled.a`
    &,
    &:link,
    &:visited {
        color: ${({ theme }) => theme.colors.textAlt};
    }
    &:hover {
        color: ${({ theme }) => theme.colors.text};
    }
    font-size: 0.9rem;
`

export const Nav = ({ closeSidebar }: { closeSidebar: () => void }) => {
    const context = usePageContext()

    return (
        <NavContainer>
            {filteredNav.map((page: any, i: number) => (
                <NavItem
                    key={i}
                    page={page}
                    currentPath={context.currentPath}
                    closeSidebar={closeSidebar}
                />
            ))}
            <div className="sidebar-locales">
                <h4>
                    <T k="general.surveys_available_languages" />
                </h4>
                <LanguageSwitcherContents />
            </div>
        </NavContainer>
    )
}

const NavContainer = styled.nav`
    flex-grow: 1;
    /* display: flex; */
    /* flex-direction: column; */
    padding: ${spacing(1.5)} ${spacing()};
    overflow-y: auto;

    @media ${mq.smallMedium} {
        align-items: center;
        overflow-y: scroll;
        overscroll-behavior: none;
    }
`

const LanguageSwitcherWrapper = styled.div`
    position: relative;
    width: 100%;
`
