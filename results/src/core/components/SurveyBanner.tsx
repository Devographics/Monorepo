import React from 'react'
import styled, { css } from 'styled-components'
import { mq, spacing, color } from 'core/theme'
import config from 'Config/config.yml'
import T from 'core/i18n/T'

const SurveyBanner = () => {
    return config.bannerId ? (
        <Banner_>
            <T k={config.bannerId} md={true} html={true} />
        </Banner_>
    ) : null
}

const Banner_ = styled.div`
    width: 100%;
    background: linear-gradient(red, blue);
`

export default SurveyBanner
