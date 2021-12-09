import React, { memo } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
// import BlockTitleOriginal from 'core/blocks/block/BlockTitle'
import ShareBlockDebug from 'core/share/ShareBlockDebug'
import BlockData from './BlockData'
import * as Tabs from '@radix-ui/react-tabs'
import BlockChart from 'core/blocks/block/BlockChart'
import BlockShare from 'core/blocks/block/BlockShare'
import BlockDebug from 'core/blocks/block/BlockDebug'
import { ChartIcon, DataIcon, ShareIcon, DebugIcon } from 'core/icons'
import { ErrorBoundary } from 'core/blocks/block/BlockError'
import { BlockVariantProps } from 'core/types'
import { usePageContext } from 'core/helpers/pageContext'

const BlockVariant = (props: BlockVariantProps) => {
    const context = usePageContext()
    const { isCapturing } = context
    const { className, children, block = {} } = props
    // id is erroring as we provide a default empty string without an ID on it.
    // potential solution is to amend the BlockDefinition with `id?: string` or have and ID on the default? unsure what's best
    const { id } = block

    return (
        <Container
            // id={id}
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
                {!isCapturing && (
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
                            {/* <TabsTrigger value="debug">
                                <DebugIcon enableTooltip={true} labelId="tabs.debug" />
                            </TabsTrigger> */}
                        </TabsList>
                    </SideArea>
                )}
                <MainArea isCapturing={isCapturing}>
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
    padding: ${spacing(0.5)};
    margin-top: ${spacing(0.25)};
    border-radius: 3px 3px 0px 0;

    button {
        display: block;
    }
    &[data-state='active'] {
        /* border: 1px dashed ${props => props.theme.colors.border}; */
        /* border-left: 0; */
        background: ${props => props.theme.colors.background};
    }
    &[data-state='inactive'] {
    }

    @media ${mq.mediumLarge} {
        margin-top: 0;
        margin-left: -1px;
        border-radius: 0 3px 3px 0;
        margin-bottom: ${spacing()};
        padding-left: ${spacing()};
    }
`

const TabsRoot = styled(Tabs.Root)`
    display: flex;
    flex-direction: column;

    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-areas: 'main side';
    }
`

const MainArea = styled.div`
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
