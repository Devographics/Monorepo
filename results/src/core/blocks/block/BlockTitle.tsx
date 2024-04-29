import './BlockTitle.scss'
import React, { memo, useState } from 'react'
import styled, { css } from 'styled-components'
import last from 'lodash/last'
import { mq, spacing, fontSize, secondaryFontMixin } from 'core/theme'
import { useI18n } from '@devographics/react-i18n'
import { usePageContext } from 'core/helpers/pageContext'
import SharePermalink from 'core/share/SharePermalink'
import BlockCompletionIndicator from 'core/blocks/block/BlockCompletionIndicator'
import { getBlockTitle, useBlockTitle } from 'core/helpers/blockHelpers'
import BlockSponsor from 'core/blocks/block/sponsor_chart/BlockSponsor'
import { useEntities } from 'core/helpers/entities'
import { BlockVariantDefinition } from 'core/types'
import { BlockQuestionTooltip } from './BlockQuestion'
import { FreeformIndicator } from 'core/charts/common2'

const BlockTitleContents = ({ block }: { block: BlockVariantDefinition }) => {
    const title = useBlockTitle({ block })
    return <Title dangerouslySetInnerHTML={{ __html: title }} />
}

const Title = styled.span``

const BlockTitle = ({
    isShareable,
    isExportable = true,
    values,
    data,
    block,
    switcher,
    closeComponent,
    view,
    setView,
    units,
    setUnits
}: {
    block: BlockVariantDefinition
}) => {
    const { id, entity } = block
    const completion =
        data && (Array.isArray(data) ? last(data) && last(data).completion : data.completion)
    const [showOptions, setShowOptions] = useState(false)
    const pageContext = usePageContext()
    const { isCapturing, currentEdition } = pageContext

    const { enableChartSponsorships } = currentEdition
    const { getString } = useI18n()

    const entities = useEntities()
    const blockTitle = getBlockTitle({ block, pageContext, getString, entities })

    const properties = {
        context: pageContext,
        block,
        isExportable,
        isShareable,
        values,
        id,
        data,
        blockTitle,
        setShowOptions,
        showOptions,
        switcher,
        view,
        setView,
        units,
        setUnits
    }
    const isFreeformQuestion = ['multiple_options2_freeform'].includes(block.template)

    return (
        <>
            <StyledBlockTitle isCapturing={isCapturing} className="Block__Title">
                <LeftPart>
                    <BlockTitleText className="BlockTitleText">
                        <SharePermalink block={block} />
                        <div className="block-title-contents">
                            <BlockTitleContents block={block} />
                            {completion && !pageContext.isCapturing && (
                                <BlockCompletionIndicator completion={completion} />
                            )}
                            <BlockQuestionTooltip block={block} />
                            {isFreeformQuestion && <FreeformIndicator showLabel={false} />}
                            {!isCapturing && enableChartSponsorships && (
                                <BlockSponsor block={block} />
                            )}
                        </div>
                    </BlockTitleText>
                    {/* <Popover trigger={<More />}>
                        <PopoverContents>
                            <BlockTitleActions {...properties} />
                            <BlockTitleSwitcher {...properties} />
                        </PopoverContents>
                    </Popover> */}
                    {/* <BlockTitleActionsWrapper>
                        <BlockTitleActions {...properties} />
                    </BlockTitleActionsWrapper> */}
                    {/* {entity && !isCapturing && <BlockLinks entity={entity} />} */}
                </LeftPart>
                {/* <BlockTitleSwitcherWrapper>
                    <BlockTitleSwitcher {...properties} />
                    {closeComponent}
                </BlockTitleSwitcherWrapper> */}
            </StyledBlockTitle>
            {/* {showDescription && <BlockDescriptionContents block={block} context={context} />} */}
        </>
    )
}

const StyledBlockTitle = styled.div`
    .rawchartmode & {
        display: none;
    }
    ${({ isCapturing }) =>
        isCapturing &&
        css`
            border-bottom: ${props => props.theme.separationBorder};
            padding-bottom: ${spacing(0.5)};
            margin-bottom: ${spacing(1)};
        `}
    display: flex;
    align-items: center;
    /* .Block__Title__Share {
        margin-left: ${spacing(0.5)};
    } */

    &:hover {
        .SharePermalink {
            opacity: 1;
        }
    }
    position: relative;
    .PopoverInner {
        position: static;
    }
    .PopoverPopup {
        &:before {
            left: auto;
            right: 0;
        }
    }
`

const BlockTitleText = styled.h3`
    margin-bottom: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    line-height: 1.2;
    ${secondaryFontMixin};
    font-size: ${fontSize('largerest')};
    code {
        font-size: ${fontSize('largest')};
    }
    @media ${mq.small} {
        flex: 1;
        font-size: ${fontSize('larger')};
        code {
            font-size: ${fontSize('large')};
        }
    }
`

const LeftPart = styled.div`
    margin-bottom: ${spacing(0.5)};
    @media ${mq.small} {
    }

    @media ${mq.mediumLarge} {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: ${spacing(0.5)};
    }
`

export default memo(BlockTitle)
