import { BlockVariantDefinition, SitemapSection } from '@devographics/types'
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
    sectionId: string
    subSectionId?: string
    sitemap: SitemapSection[]
}): BlockVariantDefinition => {
    const { blockId, sectionId, subSectionId, sitemap } = options
    const section = sitemap.find(section => section.id === sectionId)
    const subSection =
        subSectionId && section?.children?.find(section => section.id === subSectionId)
    const sectionOrSubSection = subSection || section
    if (!sectionOrSubSection?.blocks) {
        throw new Error(
            `getBlock: section ${sectionId}/${subSectionId} does not have any blocks defined`
        )
    }
    const variants = sectionOrSubSection.blocks.map(b => b.variants).flat()
    const allSectionVariants = compact([
        ...sectionOrSubSection.blocks,
        ...variants
    ]) as BlockVariantDefinition[]
    const block = allSectionVariants.find(b => b.id === blockId)
    if (!block) {
        throw new Error(`getBlock: could not find block for id ${blockId}`)
    }
    return block
}
