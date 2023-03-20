import React, { useState } from 'react'
import BlockSwitcher from 'core/blocks/block/BlockSwitcher'
import { usePageContext } from 'core/helpers/pageContext'
import allBlocks from 'Config/blocks.yml'
import styled, { css } from 'styled-components'
import { mq, spacing, color } from 'core/theme'
import ReportBlockTitle from 'core/report/ReportBlockTitle'

const BlockImport = ({ id, children, size = 's', title }) => {
    const [triggerId, setTriggerId] = useState()
    const pageContext = usePageContext()
    const block = allBlocks.find(b => b.id === id && b.isReport)

    if (!block) {
        return <div>Missing block {id}</div>
    }

    const newBlock = {
        ...block,
        hidden: false,
        showDescription: false,
        showNote: false,
        legendPosition: 'bottom',
        height: '100%',
        title,
        overrides: {
            BlockTitle: ReportBlockTitle
        }
    }

    const childrenWithExtraProp = React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
            triggerId,
            setTriggerId,
            isFirst: index === 0,
            isLast: index === children.length - 1
        })
    )

    const hasOverlays = typeof children !== 'undefined'

    return (
        <ChartWrapper className="ChartWrapper" size={size}>
            <ChartContents className="ChartContents" hasOverlays={hasOverlays} size={size}>
                <ChartContentsInner size={size}>
                    <BlockSwitcher
                        pageData={pageContext.pageData}
                        block={newBlock}
                        triggerId={triggerId}
                    />
                </ChartContentsInner>
            </ChartContents>
            <ChartOverlays className="ChartOverlays" size={size}>
                {childrenWithExtraProp}
            </ChartOverlays>
        </ChartWrapper>
    )
}

const ChartWrapper = styled.div`
    padding: ${spacing(2)} 0;
    ${({ size }) => {
        if (size === 's') {
            return css``
        } else if (size === 'm') {
            return css`
                width: 1100px;
                margin-left: calc(50% - 550px);
            `
        } else if (size === 'l') {
            return css`
                width: 100vw;
                margin-left: calc(50% - 50vw);
                padding: ${spacing(2)} ${spacing(6)};
            `
        }
    }}
`

const ChartContents = styled.div`
    ${({ hasOverlays }) =>
        hasOverlays &&
        css`
            position: sticky;
            top: 0;
            height: 100vh;
            padding: ${spacing(2)} 0;
            /* background: rebeccapurple; */
        `}
`

const ChartContentsInner = styled.div`
    ${({ size }) =>
        size === 'l' &&
        css`
            width: 100%;
            height: 100%;
            .Block {
                /* background: #004400; */
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;
            }
            .Block__Title {
                /* background: #444400; */
            }
            .Block__Contents {
                /* background: #440000; */
                flex-grow: 1;
            }
            .Block__Legends {
                /* background: #440044; */
            }
        `}
`

const ChartOverlays = styled.div`
    pointer-events: none;
`

export default BlockImport
