import React from 'react'
import styled, { css } from 'styled-components'
import { mq, spacing, color } from 'core/theme'
import config from 'Config/config.yml'
import T from 'core/i18n/T'
import { CloseIcon } from 'core/icons'
import { useStickyState } from 'core/filters/helpers'

const SurveyBanner = () => {
    const [showBanner, setShowBanner] = useStickyState(true, 'hideBanner')
    const { bannerId, bannerLink, bannerBg, bannerButton, bannerText } = config

    const style = {
        '--bannerBg': bannerBg,
        '--bannerButton': bannerButton,
        '--bannerText': bannerText
    }

    return config.bannerId && config.bannerLink && showBanner ? (
        <div style={style}>
            <Banner_>
                <a href={bannerLink} rel="noreferrer" target="_blank">
                    <span className="survey-ongoing">
                        <T k="results.ongoing_survey" />
                    </span>
                    <T k={bannerId} md={true} html={true} />
                </a>
                <CloseIcon
                    onClick={() => {
                        setShowBanner(false)
                    }}
                />
            </Banner_>
        </div>
    ) : null
}

const Banner_ = styled.div`
    grid-area: banner;
    width: 100%;
    background: var(--bannerBg, var(--backgroundAltColor));
    text-align: center;
    position: relative;
    padding: 7px 10px;
    border-bottom: 1px dashed var(--borderColor);

    @media ${mq.small} {
        padding-right: 30px;
    }
    /* a {
        color: var(--textColor);
    } */
    a {
        color: var(--bannerText);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--halfSpacing);
    }
    div {
        /* line-height: 1; */
    }
    .icon-wrapper {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        @media ${mq.small} {
            right: 5px;
        }
    }
    .survey-ongoing {
        background: var(--bannerButton, var(--linkColor));
        border-radius: 3px;
        text-transform: uppercase;
        color: var(--textColorInverted);
        padding: 2px 6px;
        font-size: 0.8rem;
        @media ${mq.small} {
            display: none;
        }
    }
`

export default SurveyBanner
