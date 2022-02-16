import React from 'react'
import { BlockDefinition } from 'core/types'
import { usePageContext } from 'core/helpers/pageContext'
import config from 'Config/config.yml'
import SponsorCredit from './SponsorCredit'
import SponsorPrompt from './SponsorPrompt'

interface BlockSponsorProps {
    block: BlockDefinition
}

const BlockSponsor = ({ block }: BlockSponsorProps) => {
    const context = usePageContext()
    const { hasSponsor } = block
    const { chartSponsors = {} } = context
    const { products = [], orders = [] } = chartSponsors
    const order = orders.find(o => o.chartId === `${config.surveySlug}___${block.id}`)
    const product = products.find(p => p.chartId === `${config.surveySlug}___${block.id}`)
    return hasSponsor ? (
        <div>
            {order ? (
                <SponsorCredit sponsor={order} />
            ) : (
                <SponsorPrompt product={product} block={block} />
            )}
        </div>
    ) : null
}

export default BlockSponsor
