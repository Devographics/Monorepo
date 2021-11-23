import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import last from 'lodash/last'
import { mq, spacing, color, screenReadersOnlyMixin } from 'core/theme'
import ShareBlock from 'core/share/ShareBlock'
import BlockExport from 'core/blocks/block/BlockExport'
import { useI18n } from 'core/i18n/i18nContext'
import { usePageContext } from 'core/helpers/pageContext'
import { getBlockMeta } from 'core/helpers/blockHelpers'
import SharePermalink from 'core/share/SharePermalink'
import BlockCompletionIndicator from 'core/blocks/block/BlockCompletionIndicator'
import { getBlockTitleKey, getBlockDescriptionKey, getBlockTitle } from 'core/helpers/blockHelpers'
import T from 'core/i18n/T'
import Button from 'core/components/Button'
import Popover from 'core/components/Popover'
import BlockViewSelector from './BlockViewSelector'
import BlockUnitsSelector from './BlockUnitsSelector'

const MoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" x="0" y="0" viewBox="0 0 24 24">
        <g>
            <g
                fill="none"
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
            >
                <circle cx="3" cy="12" r="2.5"></circle>
                <circle cx="12" cy="12" r="2.5"></circle>
                <circle cx="21" cy="12" r="2.5"></circle>
            </g>
        </g>
        <path fill="none" d="M0 0H24V24H0z"></path>
    </svg>
)

const More = (props) => {
    const { translate } = useI18n()
  
    return (
      <MoreButton {...props}>
          <ScreenReadersHint>{translate('general.more_actions')}</ScreenReadersHint>
          <MoreIcon />
      </MoreButton>
    );
}

const ScreenReadersHint = styled.span`
    ${screenReadersOnlyMixin}
`

const MoreButton = styled(Button)`
    @media ${mq.mediumLarge} {
        display: none;
    }
    padding: 0px 8px;
    svg {
        display: block;
        width: 18px;
    }
    g {
        stroke: ${color('text')};
    }
`
const BlockTitleContents = ({ block, context }) => {
    const { title, titleLink } = block
    if (title) {
        return titleLink ? <a href={titleLink}>{title}</a> : title
    } else {
        return <T k={getBlockTitleKey(block, context)} />
    }
}

const BlockDescriptionContents = ({ block, context }) => {
    const { translate } = useI18n()
    const { description, enableDescriptionMarkdown = true } = block
    const key = `${getBlockDescriptionKey(block, context)}`
    if (description || translate(key, {}, null)) {
        return (
            <Description className="Block__Description">
                <T t={description} k={key} md={enableDescriptionMarkdown} fallback={null} />
            </Description>
        )
    }
    return null
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
    const { id, showDescription = true } = block
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

const BlockTitleSwitcher = ({ switcher, units, setUnits, view, setView }) => (
    <ButtonWrapper cols={(view && units) || (view && switcher)}>
        {view && <BlockChartControls className="BlockChartControls">
          <BlockViewSelector view={view} setView={(clickedView)=>{setView(clickedView)}} />
        </BlockChartControls>}
        {switcher ? (
            <BlockChartControls className="BlockChartControls">{switcher}</BlockChartControls>
        ) : (
            units &&
            setUnits && (
                <BlockChartControls className="BlockChartControls">
                    <BlockUnitsSelector units={units} onChange={setUnits} />
                </BlockChartControls>
            )
        )}
    </ButtonWrapper>
)

const ButtonWrapper = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.cols ? '1fr 1fr' : '1fr'};
  column-gap: 1rem;
`;

BlockTitle.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.node,
        titleId: PropTypes.string,
        description: PropTypes.node,
        descriptionId: PropTypes.string,
    }).isRequired,
    showDescription: PropTypes.bool.isRequired,
    isShareable: PropTypes.bool.isRequired,
}

BlockTitle.defaultProps = {
    showDescription: true,
    isShareable: true,
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

const Description = styled.div`
    margin-bottom: ${spacing(1)};

    p {
        &:last-child {
            margin: 0;
        }
    }
`

const BlockChartControls = styled.div`
    @media ${mq.small} {
    }
    @media ${mq.mediumLarge} {
        display: flex;
        justify-content: flex-end;
    }

    .capture & {
        display: none;
    }
`

const PopoverContents = styled.div`
    .ShareBlock,
    .BlockChartControls {
        margin-top: ${spacing()};
    }
`

const BlockTitleActionsWrapper = styled.div`
    @media ${mq.small} {
        display: none;
    }
    @media ${mq.mediumLarge} {
        display: flex;
        .ShareBlock {
            margin-left: ${spacing(0.5)};
        }
    }
`

const BlockTitleSwitcherWrapper = styled.div`
    @media ${mq.small} {
        display: none;
    }
`

export default memo(BlockTitle)
