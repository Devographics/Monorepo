import React from 'react'
import styled, { css } from 'styled-components'
import { mq, spacing, color } from 'core/theme'
import config from 'Config/config.yml'
import T from 'core/i18n/T'
import { CloseIcon } from 'core/icons'
import { useStickyState } from 'core/filters/helpers'

const SurveyBanner = () => {
    const [showBanner, setShowBanner] = useStickyState(true, 'hideBanner')
    return config.bannerId && config.bannerLink && showBanner ? (
        <Banner_ style={{ backgroundColor: config.bannerColor }}>
            <a href={config.bannerLink} rel="noreferrer" target="_blank">
                <T k={config.bannerId} md={true} html={true} />
            </a>
            <CloseIcon
                onClick={() => {
                    setShowBanner(false)
                }}
            />
        </Banner_>
    ) : null
}

const Banner_ = styled.div`
    width: 100%;
    background: var(--backgroundAltColor);
    text-align: center;
    position: relative;
    padding: 7px 10px;
    border-bottom: 1px dashed var(--borderColor);
    a {
        color: var(--textColor);
    }
    .icon-wrapper {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
    }
`

export default SurveyBanner
