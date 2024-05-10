import React from 'react'
import ReportContents from 'Config/report.mdx'
import styled from 'styled-components'
import { mq, color, spacing, fontSize, fontWeight } from 'core/theme'
// import Logo from 'core/components/Logo'

const debug = false

export default () => (
    <Essay className="Essay">
        {/* <Logo size="l" /> */}
        <ReportContents />
        {debug && (
            <>
                <TopTrigger />
                <BottomTrigger />
            </>
        )}
    </Essay>
)

const Trigger = styled.div`
    position: fixed;
    height: 1px;
    background: red;
    left: 0px;
    right: 0px;
    z-index: 10000;
`
const TopTrigger = styled(Trigger)`
    top: 20vh;
`
const BottomTrigger = styled(Trigger)`
    top: 80vh;
`
const Essay = styled.div`
    .first {
    }
    & > p {
        font-size: ${fontSize('large')};
        line-height: 2;
        margin-bottom: ${spacing(1.5)};
        &:first-of-type:first-line {
            font-size: ${fontSize('largest')};
        }
    }
    code {
        background: ${color('backgroundAlt')};
        padding: 3px 6px;
        font-weight: ${fontWeight('medium')};
        color: ${color('contrast')};
        border: 1px dotted ${color('contrast')};
        font-size: ${fontSize('smallish')};
    }
`
