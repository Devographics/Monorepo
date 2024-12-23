import { BlockVariantComputed, BlockVariantDefinition, SitemapSection } from '@devographics/types'
import compact from 'lodash/compact.js'

export const getAllBlocks = ({ sitemap }: { sitemap: SitemapSection[] }) => {
    const allBlocks = []
    for (const section of sitemap) {
        if (section.blocks) {
            for (const block of section.blocks) {
                allBlocks.push(block)
            }
        }
        if (section.children) {
            for (const subSection of section.children) {
                if (subSection.blocks) {
                    for (const block of subSection.blocks) {
                        allBlocks.push(block)
                    }
                }
            }
        }
    }
    return allBlocks
}

/*

Find block definition in sitemap, looking through all sections, 
their subsections, their blocks, and the block variants. 

*/
export const getBlock = (options: {
    blockId: string
    editionId: string
    sitemap: SitemapSection[]
}): BlockVariantComputed => {
    const { blockId, sitemap, editionId } = options
    const allSections = sitemap
    const allBlocks = allSections.map(section => section.blocks).flat()
    const allVariants = allBlocks.map(block => block.variants).flat()
    const blockVariant = allVariants.find(block => block?.id === blockId)
    if (!blockVariant) {
        console.warn(`getBlock: could not find block for id ${editionId}/${blockId}`)
        return
    }
    return blockVariant
}
