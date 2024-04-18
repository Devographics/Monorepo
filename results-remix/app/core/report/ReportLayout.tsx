import React from 'react'
import styled from 'styled-components'

const EssayLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Page>
            <PageContent className="PageContent">
                {/* <PageMetaDebug /> */}
                {children}
            </PageContent>
        </Page>
    )
}

const PageContent = styled.main`
    max-width: 800px;
    margin: 0 auto;
`

const Page = styled.div``

export default EssayLayout
