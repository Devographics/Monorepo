import React, { memo, useState } from 'react'
import styled, { css } from 'styled-components'
import last from 'lodash/last'
import { mq, spacing, fontSize, secondaryFontMixin } from 'core/theme'
import { useI18n } from 'core/i18n/i18nContext'
import { usePageContext } from 'core/helpers/pageContext'
import SharePermalink from 'core/share/SharePermalink'
import BlockCompletionIndicator from 'core/blocks/block/BlockCompletionIndicator'
import { getBlockTakeaway, useBlockTitle, useBlockTakeaway } from 'core/helpers/blockHelpers'
import BlockSponsor from 'core/blocks/block/sponsor_chart/BlockSponsor'
import { useEntities } from 'core/helpers/entities'
import { BlockDefinition } from 'core/types'

const BlockTakeaway = ({ block }: { block: BlockDefinition }) => {
    const takeaway = useBlockTakeaway({ block })
    return takeaway ? <Takeaway_ dangerouslySetInnerHTML={{ __html: takeaway }} /> : null
}

const Takeaway_ = styled.span``

export default memo(BlockTakeaway)
