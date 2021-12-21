import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import last from 'lodash/last'
import { mq, spacing, fontSize, secondaryFontMixin } from 'core/theme'
import ShareBlock from 'core/share/ShareBlock'
import BlockExport from 'core/blocks/block/BlockExport'
import { useI18n } from 'core/i18n/i18nContext'
import { usePageContext } from 'core/helpers/pageContext'
import SharePermalink from 'core/share/SharePermalink'
import BlockCompletionIndicator from 'core/blocks/block/BlockCompletionIndicator'
import { getBlockMeta, getBlockTitleKey, getBlockTitle } from 'core/helpers/blockHelpers'
import BlockLinks from 'core/blocks/block/BlockLinks'

const BlockTitleContents = ({ block, context }) => {
    const { translate } = useI18n()
    return <Title dangerouslySetInnerHTML={{ __html: getBlockTitle(block, context, translate) }} />
}

const Title = styled.span`
`

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
}) => {
    const { id, entity } = block
    const completion =
        data && (Array.isArray(data) ? last(data) && last(data).completion : data.completion)
    const [showOptions, setShowOptions] = useState(false)
    const context = usePageContext()
    const { isCapturing } = context

    const { translate } = useI18n()

    const blockTitle = getBlockTitle(block, context, translate)

    const properties = {
        context,
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

    return (
        <>
            <StyledBlockTitle isCapturing={isCapturing} className="Block__Title">
                <LeftPart>
                    <BlockTitleText className="BlockTitleText">
                        <SharePermalink block={block} />
                        <BlockTitleContents block={block} context={context} />
                        {completion && !context.isCapturing && (
                            <BlockCompletionIndicator completion={completion} />
                        )}
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
                    {entity && !isCapturing && <BlockLinks entity={entity} />}
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

BlockTitle.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.node,
        titleId: PropTypes.string,
        description: PropTypes.node,
        descriptionId: PropTypes.string
    }).isRequired,
    isShareable: PropTypes.bool
}

const StyledBlockTitle = styled.div`
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
    @media ${mq.small} {
        flex: 1;
        font-size: ${fontSize('larger')};
    }
`

const LeftPart = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: ${spacing(0.5)};
`

export default memo(BlockTitle)
