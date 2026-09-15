/**
 * A taxonomy is an optional, named hierarchy layered on top of entities. Unlike
 * an entity's default `parentId`, a taxonomy groups the same entities
 * differently in a specific context (e.g. job titles by role vs. by domain),
 * which lets a "virtual" question regroup already-normalized tokens without
 * duplicating any data.
 *
 * Every node has the same recursive shape at every level, so the tree can be any
 * number of levels deep.
 */
export interface TaxonomyNode {
    id: string
    children?: TaxonomyNode[]
}

export interface Taxonomy {
    id: string
    name?: string
    description?: string
    // ids of the normalization field(s) this taxonomy is designed for
    appliesTo?: string[]
    tree: TaxonomyNode[]
}
