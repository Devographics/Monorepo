import React, { memo, useState } from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import ShareBlock from 'core/share/ShareBlock'
import { useI18n } from '@devographics/react-i18n'
import { usePageContext } from 'core/helpers/pageContext'
import { getBlockTitleKey, getBlockTitle } from 'core/helpers/blockHelpers'
import T from 'core/i18n/T'

const BlockTitleContents = ({ block, pageContext }) => {
    const { title, titleLink } = block
    if (title) {
        return titleLink ? <a href={titleLink}>{title}</a> : title
    } else {
        return <T k={getBlockTitleKey({ block, pageContext })} />
    }
}

const BlockTitle = ({ isShareable, values, block }) => {
    const [showOptions, setShowOptions] = useState(false)
    const pageContext = usePageContext()
    const { getFallbacks } = useI18n()

    const blockTitle = getBlockTitle({ block, pageContext, getFallbacks })

    return (
        <>
            <StyledBlockTitle
                className={`Block__Title Block__Title--${showOptions ? 'open' : 'closed'}`}
            >
                <LeftPart>
                    <BlockTitleText className="BlockTitleText">
                        <BlockTitleContents block={block} context={pageContext} />
                        {/* {completion && !context.isCapturing && (
                            <BlockCompletionIndicator completion={completion} />
                        )} */}
                    </BlockTitleText>
                    {isShareable && !pageContext.isCapturing && (
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
                </LeftPart>
            </StyledBlockTitle>
        </>
    )
}

const StyledBlockTitle = styled.div`
    margin-bottom: ${spacing(1)};
    display: flex;
    align-items: center;
    position: relative;
    z-index: 10;
    /* .Block__Title__Share {
        margin-left: ${spacing(0.5)};
    } */

    &:hover {
        .SharePermalink {
            opacity: 1;
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

        .Block__Title--open & {
            opacity: 0.2;
        }
    }
`

const LeftPart = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
`

export default memo(BlockTitle)
