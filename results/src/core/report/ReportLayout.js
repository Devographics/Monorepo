import React from 'react'
import styled, { css } from 'styled-components'
import { mq, spacing } from 'core/theme'

const EssayLayout = ({ props }) => {
    return (
        <Page>
            <PageContent className="PageContent">
                {/* <PageMetaDebug /> */}
                {props.children}
            </PageContent>
        </Page>
    )
}

const PageContent = styled.main`
    max-width: 800px;
    margin: 0 auto;
`

const Page = styled.div``

const PageMain = styled.main``

export default EssayLayout
