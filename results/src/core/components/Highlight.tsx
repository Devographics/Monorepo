import React, { Children, ReactElement, cloneElement, createContext, useContext, useState } from 'react'
import classNames from 'classnames'
import { usePageContext } from 'core/helpers/pageContext'
import './Highlight.scss'

/*

Highlight chart elements (tabs, rows, bar segments…) when hovering
a datapoint in a takeaway.

This is separate from the charts' own hover highlighting (highlightedRow, etc.)
so both can be styled differently.

*/

// the datapoint currently hovered in a takeaway
export interface HighlightedDatapoint {
    blockId: string
    // edition the value comes from
    editionId: string
    // e.g. ['company_employee.increased'], empty for question-level stats
    elementIds: string[]
}

interface HighlightContextValue {
    highlighted: HighlightedDatapoint | null
    setHighlighted: (highlighted: HighlightedDatapoint | null) => void
}

const HighlightContext = createContext<HighlightContextValue>({
    highlighted: null,
    setHighlighted: () => {}
})

export const HighlightProvider = ({ children }: { children: React.ReactNode }) => {
    const [highlighted, setHighlighted] = useState<HighlightedDatapoint | null>(null)
    return (
        <HighlightContext.Provider value={{ highlighted, setHighlighted }}>
            {children}
        </HighlightContext.Provider>
    )
}

export const useHighlightContext = () => useContext(HighlightContext)

export interface HighlightIds {
    blockId: string
    // only needed for elements showing a specific edition (e.g. verticalBar2 columns)
    editionId?: string
    bucketId?: string
    facetBucketId?: string
}

// "target" is the element the datapoint points to,
// "ancestor" is any element containing it (tab, row…)
export type HighlightState = 'target' | 'ancestor' | null

// a datapoint for a filtered series (`foo_2`) also belongs to variant `foo`
const belongsToBlock = (datapointBlockId: string, blockId: string) =>
    datapointBlockId === blockId || new RegExp(`^${blockId}_\\d+$`).test(datapointBlockId)

export const getElementId = ({ bucketId, facetBucketId }: HighlightIds) => {
    const ids = []
    if (bucketId) {
        ids.push(bucketId)
        if (facetBucketId) {
            ids.push(facetBucketId)
        }
    }
    return ids.join('.')
}

/*

Editions: elements with an editionId must match the datapoint's edition.
Other elements with bucket ids are assumed to show the current edition,
while block-level elements without an edition (tabs) match any edition.

*/
const matchesEdition = ({
    highlighted,
    ids,
    currentEditionId
}: {
    highlighted: HighlightedDatapoint
    ids: HighlightIds
    currentEditionId: string
}) => {
    if (ids.editionId) {
        return ids.editionId === highlighted.editionId
    } else if (ids.bucketId) {
        return highlighted.editionId === currentEditionId
    } else {
        return true
    }
}

export const getHighlightState = ({
    highlighted,
    ids,
    currentEditionId
}: {
    highlighted: HighlightedDatapoint | null
    ids: HighlightIds
    currentEditionId: string
}): HighlightState => {
    if (!highlighted || !belongsToBlock(highlighted.blockId, ids.blockId)) {
        return null
    }
    if (!matchesEdition({ highlighted, ids, currentEditionId })) {
        return null
    }
    const elementId = getElementId(ids)
    if (!elementId) {
        // block-level element (tab, edition column…): it's the target for question-level stats
        return highlighted.elementIds.length > 0 ? 'ancestor' : 'target'
    }
    let state: HighlightState = null
    for (const targetId of highlighted.elementIds) {
        if (targetId === elementId) {
            return 'target'
        } else if (targetId.startsWith(elementId + '.')) {
            state = 'ancestor'
        }
    }
    return state
}

// ids are optional so components can call the hook unconditionally
export const useHighlight = (ids?: HighlightIds) => {
    const { highlighted } = useHighlightContext()
    const { currentEdition } = usePageContext()
    if (!ids) {
        return { state: null, attributes: {} }
    }
    const state = getHighlightState({ highlighted, ids, currentEditionId: currentEdition.id })
    const elementId = getElementId(ids)
    const attributes = {
        'data-datapoint-block': ids.blockId,
        'data-datapoint-edition': ids.editionId,
        'data-datapoint': elementId || undefined
    }
    return { state, attributes }
}

/*

Add highlight attributes and classes to its single child, without adding an element.
The child must accept className (DOM elements, SVG elements, styled-components…);
otherwise use useHighlight() directly.

Without a blockId (e.g. when a component only sometimes needs highlighting),
the child is returned unchanged.

*/
export const Highlight = ({
    children,
    ...ids
}: Partial<HighlightIds> & { children: ReactElement }) => {
    const { blockId } = ids
    const { state, attributes } = useHighlight(blockId ? { ...ids, blockId } : undefined)
    const child = Children.only(children)
    if (!blockId) {
        return child
    }
    return cloneElement(child, {
        ...attributes,
        className: classNames(child.props.className, state && `datapoint-${state}`)
    })
}

export default Highlight
