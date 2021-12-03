import React from 'react'
import isEmpty from 'lodash/isEmpty'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import { usePageContext } from 'core/helpers/pageContext'
import Link from 'core/components/LocaleLink'
import Button from 'core/components/Button'
import PageLabel from './PageLabel'
import config from 'Config/config.yml'
import T from 'core/i18n/T'

const PageFooter = () => {
    const context = usePageContext()

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
                <T k="general.charts_nivo" values={{ link: 'https://nivo.rocks/' }} html={true} />{' '}
                <T
                    k="general.netlify_link"
                    values={{ link: 'https://www.netlify.com' }}
                    html={true}
                />
                <br />
                <T k="general.leave_issue" values={{ link: config.issuesUrl }} html={true} />{' '}
                <T k="general.join_discord" values={{ link: config.discordUrl }} html={true} />
                {context.locale.id !== 'en-US' && (
                    <>
                        <br />
                        <T k="general.translator_mode" />{' '}
                    </>
                )}
            </Notes>
        </Container>
    )
}

const Container = styled.div`
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
  flex:1 1 min-content;

  @media ${mq.mediumLarge} {
    flex:0 1 max-content;
  }
`

const NextLink = styled(FooterLink)`
  flex:1 1 min-content;

  @media ${mq.mediumLarge} {
    flex:0 1 max-content;
  }
`

const LinkLabel = styled.span`
    @media ${mq.small} {
        display: none;
    }
`

export default PageFooter
