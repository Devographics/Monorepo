import React from 'react'
import parse, { DOMNode, domToReact, Element, HTMLReactParserOptions } from 'html-react-parser'
import Tooltip from 'core/components/Tooltip'
import { HighlightedDatapoint, useHighlightContext } from 'core/components/Highlight'

/*

A datapoint in a takeaway (see core/helpers/datapoints.ts):

- hovering or focusing it highlights the matching chart elements
- clicking it (or pressing Enter) opens the tab its chart is in
- for [text]{path} links, the value is shown in a tooltip

*/
export const Datapoint = ({
    datapoint,
    value,
    children
}: {
    datapoint: HighlightedDatapoint
    // formatted value, only for [text]{path} links where the text doesn't show it
    value?: string
    children: React.ReactNode
}) => {
    const { setHighlighted, select, opensTab } = useHighlightContext()

    const span = (
        <span
            // datapoint-opens-tab: clicking it would switch to another tab
            className={opensTab(datapoint) ? 'datapoint datapoint-opens-tab' : 'datapoint'}
            data-datapoint-block={datapoint.blockId}
            data-datapoint-edition={datapoint.editionId}
            data-datapoint={datapoint.elementIds.join(' ')}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setHighlighted(datapoint)}
            onMouseLeave={() => setHighlighted(null)}
            onFocus={() => setHighlighted(datapoint)}
            onBlur={() => setHighlighted(null)}
            onClick={() => select(datapoint)}
            onKeyDown={event => {
                if (event.key === 'Enter') {
                    select(datapoint)
                }
            }}
        >
            {children}
        </span>
    )

    return value ? <Tooltip trigger={span} contents={value} showBorder={false} /> : span
}

// turn the datapoint spans of a takeaway's HTML into Datapoint components
const parserOptions: HTMLReactParserOptions = {
    replace: domNode => {
        if (domNode instanceof Element && domNode.attribs.class === 'datapoint') {
            const { attribs } = domNode
            const datapoint = {
                blockId: attribs['data-datapoint-block'],
                editionId: attribs['data-datapoint-edition'],
                elementIds: (attribs['data-datapoint'] || '').split(' ').filter(Boolean)
            }
            return (
                <Datapoint datapoint={datapoint} value={attribs['data-datapoint-value']}>
                    {domToReact(domNode.children as DOMNode[], parserOptions)}
                </Datapoint>
            )
        }
    }
}

export const parseTakeaway = (html: string) => parse(html, parserOptions)

export default Datapoint
