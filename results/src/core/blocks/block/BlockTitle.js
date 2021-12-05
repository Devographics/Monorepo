import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import last from 'lodash/last'
import { mq, spacing } from 'core/theme'
import ShareBlock from 'core/share/ShareBlock'
import BlockExport from 'core/blocks/block/BlockExport'
import { useI18n } from 'core/i18n/i18nContext'
import { usePageContext } from 'core/helpers/pageContext'
import SharePermalink from 'core/share/SharePermalink'
import BlockCompletionIndicator from 'core/blocks/block/BlockCompletionIndicator'
import { getBlockMeta, getBlockTitleKey, getBlockTitle } from 'core/helpers/blockHelpers'
import T from 'core/i18n/T'

const BlockTitleContents = ({ block, context }) => {
    const { title, titleLink } = block
    if (title) {
        return titleLink ? <a href={titleLink}>{title}</a> : title
    } else {
        return <T k={getBlockTitleKey(block, context)} html={true} />
    }
}


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
    setUnits,
}) => {
    const { id } = block
    const completion =
        data && (Array.isArray(data) ? last(data) && last(data).completion : data.completion)
    const [showOptions, setShowOptions] = useState(false)
    const context = usePageContext()
    const { translate } = useI18n()

    const blockTitle = getBlockTitle(block, context, translate)
    const blockMeta = getBlockMeta(block, context, translate)

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
        setUnits,
    }

    return (
        <>
            <StyledBlockTitle className="Block__Title">
                <LeftPart>
                    <BlockTitleText className="BlockTitleText">
                        <SharePermalink url={blockMeta.link} />
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
                    </Popover>
                    <BlockTitleActionsWrapper>
                        <BlockTitleActions {...properties} />
                    </BlockTitleActionsWrapper> */}
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

const BlockTitleActions = ({
    isExportable,
    isShareable,
    values,
    block,
    context,
    id,
    data,
    blockTitle,
    setShowOptions,
    showOptions,
}) => (
    <>
        {isExportable && block && !context.isCapturing && (
            <BlockExport
                id={id}
                data={data}
                block={block}
                title={blockTitle}
                className="Block__Title__Export"
            />
        )}
        {isShareable && !context.isCapturing && (
            <ShareBlock
                block={block}
                className="Block__Title__Share"
                values={values}
                title={blockTitle}
                toggleClass={() => {
                    setShowOptions(!showOptions)
                }}
            />
        )}
    </>
)

BlockTitle.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.node,
        titleId: PropTypes.string,
        description: PropTypes.node,
        descriptionId: PropTypes.string,
    }).isRequired,
    isShareable: PropTypes.bool.isRequired,
}

const StyledBlockTitle = styled.div`
    /* border-bottom: ${(props) => props.theme.separationBorder};
    padding-bottom: ${spacing(0.5)};
    margin-bottom: ${spacing(1)}; */
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
    @media ${mq.small} {
        opacity: 1;
        transition: all 300ms ease-in;
        flex: 1;
    }
`

const LeftPart = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
`

export default memo(BlockTitle)
