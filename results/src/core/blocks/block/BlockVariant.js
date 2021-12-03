import React, { memo } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import BlockTitleOriginal from 'core/blocks/block/BlockTitle'
import ShareBlockDebug from 'core/share/ShareBlockDebug'
import BlockData from './BlockData'
import * as Tabs from '@radix-ui/react-tabs'
import BlockChart from 'core/blocks/block/BlockChart'
import BlockShare from 'core/blocks/block/BlockShare'
import BlockDebug from 'core/blocks/block/BlockDebug'
import { ChartIcon, DataIcon, ShareIcon, DebugIcon } from 'core/icons'
import { ErrorBoundary } from 'core/blocks/block/BlockError'

const BlockVariant = (props) => {
    const {
        className,
        children,
        block = {},
    } = props
    
    const {
        id,
    } = block


    return (
        <Container
            id={id}
            className={`Block Block--${id}${className !== undefined ? ` ${className}` : ''}`}
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

            <TabsRoot defaultValue="chart" orientation="vertical">
                <SideArea>
                    <TabsList aria-label="tabs example">
                        <TabsTrigger value="chart">
                            <ChartIcon enableTooltip={true} labelId="tabs.chart" />
                        </TabsTrigger>
                        <TabsTrigger value="data">
                            <DataIcon enableTooltip={true} labelId="tabs.data" />
                        </TabsTrigger>
                        <TabsTrigger value="share">
                            <ShareIcon enableTooltip={true} labelId="tabs.share" />
                        </TabsTrigger>
                        <TabsTrigger value="debug">
                            <DebugIcon enableTooltip={true} labelId="tabs.debug" />
                        </TabsTrigger>
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
                    <Tabs.Content value="debug">
                        <TabWithBoundary>
                            <BlockDebug {...props} />
                        </TabWithBoundary>
                    </Tabs.Content>
                </MainArea>
            </TabsRoot>
        </Container>
    )
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
`

const TabsList = styled(Tabs.List)`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`

const TabsTrigger = styled(Tabs.Trigger)`
    cursor: pointer;
    margin-bottom: ${spacing()};
    padding: ${spacing(0.5)};
    padding-left: ${spacing()};
    margin-left: -1px;
    border-radius: 0 3px 3px 0;
    button {
        display: block;
    }
    &[data-state='active'] {
        /* border: 1px dashed ${(props) => props.theme.colors.border}; */
        /* border-left: 0; */
        background: ${(props) => props.theme.colors.background};
    }
    &[data-state='inactive'] {
    }
`

const TabsRoot = styled(Tabs.Root)`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas: 'main side';
`

const MainArea = styled.div`
    grid-area: main;
    padding-top: ${spacing()};
`

const SideArea = styled.div`
    grid-area: side;
    /* border-bottom: ${(props) => props.theme.border}; */
    /* border-right: ${(props) => props.theme.border}; */
    /* border-left: ${(props) => props.theme.separationBorder}; */
    /* padding-right: ${spacing()}; */
    padding-top: ${spacing(2)};
    padding-right: ${spacing(0.5)};
    margin-left: ${spacing()};
    /* background: ${(props) => props.theme.colors.backgroundForeground}; */
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAAXNSR0IArs4c6QAAACZJREFUGFdjZEAD////b2BEFgMLMDIiBGECIEVglcgCYEF0AZAgAOgcE4P59g1CAAAAAElFTkSuQmCC')
        repeat;
`

BlockVariant.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.node,
        description: PropTypes.node,
    }).isRequired,
    isShareable: PropTypes.bool.isRequired,
    className: PropTypes.string,
    values: PropTypes.object,
}

export default memo(BlockVariant)
