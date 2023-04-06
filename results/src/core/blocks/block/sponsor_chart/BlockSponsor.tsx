import React from 'react'
import { BlockDefinition } from '@types/index'
import { usePageContext } from 'core/helpers/pageContext'
import SponsorCredit from './SponsorCredit'
import SponsorPrompt from './SponsorPrompt'

interface BlockSponsorProps {
    block: BlockDefinition
}

const BlockSponsor = ({ block }: BlockSponsorProps) => {
    const context = usePageContext()
    const { hasSponsor } = block
    const { currentEdition, chartSponsors = {} } = context
    const { products = [], orders = [] } = chartSponsors
    const order = orders.find(o => o.chartId === `${currentEdition.id}___${block.id}`)
    const product = products.find(p => p.chartId === `${currentEdition.id}___${block.id}`)

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
