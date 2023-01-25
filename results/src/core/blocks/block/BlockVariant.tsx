import React, { memo, PropsWithChildren, ReactNode } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
// import BlockTitleOriginal from 'core/blocks/block/BlockTitle'
import ShareBlockDebug from 'core/share/ShareBlockDebug'
import BlockData from './BlockData'
import * as Tabs from '@radix-ui/react-tabs'
import BlockChart from 'core/blocks/block/BlockChart'
import BlockShare from 'core/blocks/block/BlockShare'
// import BlockDebug from 'core/blocks/block/BlockDebug'
import { ChartIcon, DataIcon, ShareIcon } from 'core/icons'
import { ErrorBoundary } from 'core/blocks/block/BlockError'
import { BlockVariantProps } from 'core/types'
import { usePageContext } from 'core/helpers/pageContext'
import CustomInputTrigger from 'core/blocks/block/CustomInputTrigger'
import CommentsTrigger from 'core/blocks/block/CommentsTrigger'
import FiltersTrigger from 'core/blocks/filters/FiltersTrigger'

const BlockVariant = (props: PropsWithChildren<BlockVariantProps>) => {
    const context = usePageContext()
    const { isCapturing } = context
    const { className, children, block = {} } = props
    // id is erroring as we provide a default empty string without an ID on it.
    // potential solution is to amend the BlockDefinition with `id?: string` or have and ID on the default? unsure what's best
    const { id, chartOnly = false } = block

    if (chartOnly) {
        return <div className="Block__Contents">{children}</div>
    } else {
        return (
            <Container
                // id={id}
                className={`Block ${
                    isCapturing ? 'Block--isCapturing' : 'Block--notcapturing'
                } Block--${id}${className !== undefined ? ` ${className}` : ''}`}
            >
                {/* {showTitle && (
                <BlockTitle
                    isShareable={isShareable}
                    units={units}
                    setUnits={setUnits}
                    data={data}
                    block={block}
                    
                    
                    {...titleProps}
                />
            )} */}
                <ShareBlockDebug block={block} />
                {isCapturing ? (
                    <BlockChart {...props}>{children}</BlockChart>
                ) : (
                    <>
                        <TabsRoot defaultValue="chart" orientation="vertical">
                            <SideArea className="Block__SideArea">
                                <TabsList aria-label="tabs example">
                                    <TabItem value="chart">
                                        <ChartIcon enableTooltip={true} labelId="tabs.chart" />
                                    </TabItem>
                                    <TabItem value="data">
                                        <DataIcon enableTooltip={true} labelId="tabs.data" />
                                    </TabItem>
                                    <TabItem value="share">
                                        <ShareIcon enableTooltip={true} labelId="tabs.share" />
                                    </TabItem>
                                    {block.enableCustomization && (
                                        <TabItem>
                                            <CustomInputTrigger {...props} />
                                        </TabItem>
                                    )}
                                    {block.hasComments && (
                                        <TabItem>
                                            <CommentsTrigger {...props} />
                                        </TabItem>
                                    )}
                                    {block.filters && block.filters.length > 0 && (
                                        <TabItem>
                                            <FiltersTrigger {...props} />
                                        </TabItem>
                                    )}
                                    {/* <TabsTrigger value="debug">
                                <DebugIcon enableTooltip={true} labelId="tabs.debug" />
                            </TabsTrigger> */}
                                </TabsList>
                            </SideArea>
                            <MainArea>
                                <Tabs.Content value="chart">
                                    <TabWithBoundary {...props}>
                                        <BlockChart {...props}>{children}</BlockChart>
                                    </TabWithBoundary>
                                </Tabs.Content>
                                <Tabs.Content value="data">
                                    <TabWithBoundary>
                                        <BlockData {...props} />
                                    </TabWithBoundary>
                                </Tabs.Content>
                                <Tabs.Content value="share">
                                    <TabWithBoundary>
                                        <BlockShare {...props} />
                                    </TabWithBoundary>
                                </Tabs.Content>
                                {/* <Tabs.Content value="debug">
                        <TabWithBoundary>
                            <BlockDebug {...props} />
                        </TabWithBoundary>
                    </Tabs.Content> */}
                            </MainArea>
                        </TabsRoot>
                    </>
                )}
            </Container>
        )
    }
}

const TabWithBoundary = ({ children, ...props }) => (
    <ErrorBoundary {...props}>{children}</ErrorBoundary>
)

const Container = styled.div`
    @media ${mq.small} {
        margin-bottom: ${spacing(2)};
    }

    @media ${mq.mediumLarge} {
        margin-bottom: ${spacing(4)};
    }

    &:last-child {
        margin-bottom: 0;
    }
    &.Block--isCapturing {
        .Block__SideArea {
            display: none;
        }
    }
`

const TabsList = styled(Tabs.List)`
    display: flex;
    width: 100%;
    justify-content: space-around;

    @media ${mq.mediumLarge} {
        justify-content: flex-start;
        align-items: flex-start;
        flex-direction: column;
    }
`

const TabsTrigger = styled(Tabs.Trigger)`
    cursor: pointer;
    padding: 0;
    border: none;
    display: block;
    &[data-state='active'] {
        /* border: 1px dashed ${props => props.theme.colors.border}; */
        /* border-left: 0; */
        background: ${props => props.theme.colors.background};
    }
    &[data-state='inactive'] {
        background: none;
    }
`

const TabsIcon = styled.div`
    display: block;
    cursor: pointer;
    position: relative;
`

const TabWrapper = styled.div`
    padding: ${spacing(0.5)};
    margin-top: ${spacing(0.25)};
    border-radius: 3px 3px 0px 0;
    @media ${mq.mediumLarge} {
        margin-top: 0;
        margin-left: -1px;
        border-radius: 0 3px 3px 0;
        margin-bottom: ${spacing()};
        padding-left: ${spacing()};
    }
    &:has([data-state='active']) {
        background: ${props => props.theme.colors.background};
    }
`

type TabItemProps = {
    children: ReactNode
    value?: string
}

const TabItem = ({ children, value }: TabItemProps) => {
    const TabInner = value ? TabsTrigger : TabsIcon
    return (
        <TabWrapper>
            <TabInner value={value}>{children}</TabInner>
        </TabWrapper>
    )
}

const TabsRoot = styled(Tabs.Root)`
    display: flex;
    flex-direction: column;

    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-areas: 'main side';
    }
`

const MainArea = styled.div<{ isCapturing?: boolean }>`
    grid-area: main;
    padding-top: ${({ isCapturing }) => (isCapturing ? 0 : spacing())};
`

const SideArea = styled.div`
    grid-area: side;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAACZJREFUGFdjZEAD////b2BEFgMLMDIiBGECIEVglcgCYEF0AZAgAOgcE4P59g1CAAAAAElFTkSuQmCC')
        repeat;

    @media ${mq.mediumLarge} {
        padding-top: ${spacing(2)};
        padding-right: ${spacing(0.5)};
        margin-left: ${spacing()};
    }
`

BlockVariant.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.node,
        description: PropTypes.node
    }).isRequired,
    isShareable: PropTypes.bool,
    className: PropTypes.string,
    values: PropTypes.object
}

export default memo(BlockVariant)
