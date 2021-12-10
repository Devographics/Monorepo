import React from 'react'
import IntroductionFooter from 'core/pages/IntroductionFooter'
import T from 'core/i18n/T'
import styled from 'styled-components'
import { mq, fontSize } from 'core/theme'
import IntroLogo from 'Logo/IntroLogo'

const SurveyIntroBlock = () => (
    <>
        <IntroLogo />
        <div className="SurveyIntro">
            <Content className="SurveyIntro__Content">
                <T k="sections.introduction.description" md={true} />
                <IntroductionFooter />
            </Content>
        </div>
    </>
)

const Content = styled.div`
    @media ${mq.large} {
        max-width: 700px;
        margin: 0 auto;
    }
    font-size: ${fontSize('large')};
    .block__content {
        p:first-child {
            @media ${mq.mediumLarge} {
                max-width: 700px;
                
            }
        }
    }
`

export default SurveyIntroBlock
