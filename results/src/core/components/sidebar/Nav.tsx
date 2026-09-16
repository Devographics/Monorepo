import React, { useContext, useEffect, useState } from 'react'
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
import { NewQuestionIndicator } from 'core/blocks/block/NewQuestionIndicator'
import { getAllQuestions } from 'core/helpers/options'

interface PageConfig {
    is_hidden?: boolean
    id: string
}
const filteredNav =
    (sitemap as Array<PageConfig> | undefined)?.filter(page => !page.is_hidden) ?? []

const getStyledLink = component => styled(component)`
    display: flex;
    /* white-space: nowrap; */
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
        margin-bottom: var(--halfSpacing);
        display: block;
    }

    @media ${mq.large} {
        .page-link-inner-label {
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
        span .page-link-inner {
            position: relative;
            &::before {
                content: '> ';
                display: block;
                position: absolute;
                right: 110%;
            }
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

/**
 * Watch the block wrappers (rendered by BlockTabsWrapper with a
 * `tabs-wrapper-${block.id}` class) and return the id of the block currently
 * sitting near the top of the viewport, so the matching sidebar link can be
 * highlighted as the user scrolls. Pass an empty array to disable observing.
 */
const useActiveBlockId = (blockIds: string[]): string | null => {
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
    // stable dependency: re-run only when the set of block ids actually changes
    const blockIdsKey = blockIds.join(',')

    useEffect(() => {
        if (typeof window === 'undefined' || blockIds.length === 0) return

        const observed = blockIds
            .map(id => {
                const el = document.querySelector(`.tabs-wrapper-${CSS.escape(id)}`)
                return el ? { id, el } : null
            })
            .filter((entry): entry is { id: string; el: Element } => entry !== null)

        if (observed.length === 0) return

        const intersecting = new Set<string>()
        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    const match = observed.find(o => o.el === entry.target)
                    if (!match) continue
                    if (entry.isIntersecting) {
                        intersecting.add(match.id)
                    } else {
                        intersecting.delete(match.id)
                    }
                }
                // the active block is the first (in document order) crossing the band
                const active = blockIds.find(id => intersecting.has(id))
                if (active) setActiveBlockId(active)
            },
            // narrow horizontal band in the upper part of the viewport: whichever
            // block crosses it is considered "in frame"
            { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
        )
        observed.forEach(({ el }) => observer.observe(el))
        return () => observer.disconnect()
    }, [blockIdsKey])

    return activeBlockId
}

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
                    b.hidden ||
                    b.showInNav === false
                )
        )

    // only the matched page renders its internal block links, so only observe then
    const activeBlockId = useActiveBlockId(match ? currentPageBlocks.map(b => b.id) : [])

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
                    <span className="page-link-inner-label">{label}</span>
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
                            isActive={block.id === activeBlockId}
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

const BlockItem = ({ block, closeSidebar, page, isActive = false }) => {
    const pageContext = usePageContext()
    const { getString, getFallbacks } = useI18n()
    const entities = useEntities()
    const { key, tClean: label } = getBlockTitle({
        block,
        pageContext,
        getFallbacks,
        entities,
        useShortLabel: true
    })
    const emojiKey = `${key}.emoji`
    const hasEmoji = !getString(emojiKey).missing

    const question = getAllQuestions(pageContext.currentEdition).find(q => q.id === block.id)

    return (
        <InternalLinkWrapper_>
            <InternalLink_
                className={`nav-link InternalLink${isActive ? ' _is-active' : ''}`}
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
                <span className="nav-link-label">{label}</span>{' '}
                <NewQuestionIndicator question={question} />
            </InternalLink_>
        </InternalLinkWrapper_>
    )
}

const InternalLinks_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--halfSpacing);
    margin-bottom: var(--halfSpacing);
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
    &._is-active {
        &,
        &:link,
        &:visited {
            color: ${({ theme }) => theme.colors.text};
        }
        font-weight: ${fontWeight('bold')};
    }
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
    padding: ${spacing(1.5)} var(--spacing);
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
