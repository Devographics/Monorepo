import React from 'react'
import isEmpty from 'lodash/isEmpty'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import { usePageContext } from 'core/helpers/pageContext'
import Link from 'core/components/LocaleLink'
import Button from 'core/components/Button'
import PageLabel from './PageLabel'
import T from 'core/i18n/T'

const PageFooter = () => {
    const context = usePageContext()
    const { currentEdition } = context
    const {
        issuesUrl = 'https://github.com/Devographics/Monorepo/issues',
        discordUrl = 'https://discord.gg/zRDb35jfrt'
    } = currentEdition

    return (
        <Container>
            <Nav>
                {context.previous && !isEmpty(context.previous) && (
                    <PreviousLink
                        as={Link}
                        className="PageFooter__Link PageFooter__Link--previous"
                        to={context.previous.path}
                    >
                        «{' '}
                        <LinkLabel>
                            <T k="page.previous" />
                        </LinkLabel>{' '}
                        <PageLabel page={context.previous} />
                    </PreviousLink>
                )}
                {context.next && !isEmpty(context.next) && (
                    <NextLink
                        as={Link}
                        className="PageFooter__Link PageFooter__Link--next Button"
                        to={context.next.path}
                    >
                        <LinkLabel>
                            <T k="page.next" />
                        </LinkLabel>{' '}
                        <PageLabel page={context.next} /> »
                    </NextLink>
                )}
            </Nav>
            <Notes>
                <T k="general.leave_issue" values={{ link: issuesUrl }} html={true} />{' '}
                <T k="general.join_discord" values={{ link: discordUrl }} html={true} />
                {context.locale.id !== 'en-US' && (
                    <>
                        <br />
                        <T k="general.translator_mode" />{' '}
                    </>
                )}
                <span>
                    &copy; {new Date().getFullYear()}{' '}
                    <a href="https://devographics.com/">Devographics</a>
                </span>
            </Notes>
        </Container>
    )
}

const Container = styled.footer`
    @media ${mq.small} {
        margin-top: ${spacing(4)};
    }
    @media ${mq.mediumLarge} {
        margin-top: ${spacing(6)};
    }
`

const Nav = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${spacing()};
    align-items: center;
    justify-content: center;
`

const Notes = styled.div`
    font-size: ${fontSize('small')};
    text-align: center;

    @media ${mq.small} {
        margin-top: ${spacing(4)};
    }
    @media ${mq.mediumLarge} {
        margin-top: ${spacing(6)};
    }
`

const FooterLink = styled(Button)`
    @media ${mq.small} {
        display: block;
        text-align: center;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
    }
`

const PreviousLink = styled(FooterLink)`
    flex: 1 1 min-content;

    @media ${mq.mediumLarge} {
        flex: 0 1 max-content;
    }
`

const NextLink = styled(FooterLink)`
    flex: 1 1 min-content;

    @media ${mq.mediumLarge} {
        flex: 0 1 max-content;
    }
`

const LinkLabel = styled.span`
    @media ${mq.small} {
        display: none;
    }
`

export default PageFooter
