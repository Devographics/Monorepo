import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import classNames from 'classnames'
import ReactGA from 'react-ga'
import { useI18n } from 'core/i18n/i18nContext'
import { getBlockMeta } from 'core/helpers/blockHelpers'
import { usePageContext } from 'core/helpers/pageContext'
import { mq } from 'core/theme'
import Button from 'core/components/Button'
import ShareTwitter from './ShareTwitter'
import ShareLinkedIn from './ShareLinkedIn'
import ShareFacebook from './ShareFacebook'
import ShareEmail from './ShareEmail'
import ShareImage from './ShareImage'
import T from 'core/i18n/T'

const ShareIcon = () => (
    <Icon
        className="mobile"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
    >
        <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            id="New_icons_1_"
            strokeWidth={2}
        >
            <line x1="11.5" y1="13.5" x2="11.5" y2="0.5" />
            <polyline points="7,5 11.5,0.5 16,5" />
            <polyline points="14.5,8.5 19.5,8.5 19.5,23.5 3.5,23.5 3.5,8.5 8.5,8.5" />
        </g>
    </Icon>
)

const ShareBlock = ({ block, section, className, toggleClass, title }) => {
    const [showOptions, setShowOptions] = useState(false)
    const context = usePageContext()
    const { translate } = useI18n()

    const toggleOptions = (e) => {
        e.preventDefault()

        // toggle parent component's class
        toggleClass && toggleClass()
        setShowOptions(!showOptions)
        ReactGA.event({
            category: 'Clicks',
            action: `${section} chart toggle`,
        })
    }

    const meta = getBlockMeta(block, context, translate, title)

    return (
        <Container
            className={classNames('ShareBlock', className, {
                '_is-visible': showOptions,
            })}
        >
            <ButtonWrapper>
                <ShareButton
                    className="ShareButton"
                    size="small"
                    onClick={(e) => {
                        toggleOptions(e)
                    }}
                    aria-haspopup="menu"
                    aria-expanded={showOptions}
                >
                    <T k="share.share" />
                    {/* <ShareIcon /> */}
                </ShareButton>
            </ButtonWrapper>
            <Popup className="ShareBlock__Popup">
                <ShareTwitter text={meta.twitterText} trackingId={meta.trackingId} />
                <ShareFacebook link={meta.link} trackingId={meta.trackingId} />
                <ShareLinkedIn link={meta.link} title={meta.title} trackingId={meta.trackingId} />
                <ShareEmail
                    subject={meta.emailSubject}
                    body={meta.emailBody}
                    trackingId={meta.trackingId}
                />
                <ShareImage trackingId={meta.trackingId} url={meta.imageUrl} />
            </Popup>
        </Container>
    )
}

ShareBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
}

const Container = styled.div`
    position: relative;
    .capture & {
        display: none;
    }
`

const ButtonWrapper = styled.div`
    @media ${mq.mediumLarge} {
        display: flex;
        justify-content: center;
        align-items: center;
    }
`

const ShareButton = styled(Button)`
    /* @media ${mq.small} {
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;

        &.Button--small {
            padding: 0;
        }
    } */
`

const Icon = styled.svg`
    stroke: ${({ theme }) => theme.colors.link};
    height: 16px;
    width: 16px;

    ${ShareButton}:hover &,
    .ShareBlock._is-visible & {
        stroke: ${({ theme }) => theme.colors.link};
    }
`

const Popup = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 300px;
    margin: 0 auto;
    pointer-events: none;

    @media ${mq.small} {
        left: 50%;
        top: 50%;
    }
    @media ${mq.mediumLarge} {
        top: 0;
        left: 110%;
    }
`

export default ShareBlock
