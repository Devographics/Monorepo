import React, { useMemo, useState } from 'react'
import { ToolExperienceId } from 'core/bucket_keys'
import { SankeyNodeDatum, SankeyLinkDatum, SankeyYear } from '../types'
import { YearsLegend } from './YearsLegend'
import { LinksBackground } from './LinksBackground'
import { LinkPercentages } from './LinkPercentages'
import { Nodes } from './Nodes'

let _uid = 0

/**
 * Used to entirely replace the default nivo Sankey component,
 * the default component is only used to compute node positions
 * and links.
 *
 * This should be passed as the only layer to the Sankey component.
 */
export const CustomSankey = ({ nodes, links }: {
    nodes: SankeyNodeDatum[]
    links: SankeyLinkDatum[]
}) => {
    console.log({
        nodes,
        links,
    })
    const [currentExperience, setCurrentExperience] = useState<ToolExperienceId>('interested')

    const uid = useMemo(() => {
        const newUid = _uid
        _uid += 1

        return newUid
    }, [])

    const {
        years,
        linksByExperience,
    } = useMemo(() => {
        const _years: SankeyYear[] = []

        const _nodesByExperience: Partial<Record<ToolExperienceId, SankeyNodeDatum[]>> = {}
        const _linksByExperience: Partial<Record<ToolExperienceId, {
            experience: ToolExperienceId
            links: SankeyLinkDatum[]
        }>> = {}

        nodes.forEach(node => {
            let year = _years.find(y => y.year === node.year)
            if (!year) {
                year = {
                    year: node.year,
                    x: node.x0 + (node.x1 - node.x0) / 2,
                }
                _years.push(year)
            }

            if (!_nodesByExperience[node.choice]) {
                _nodesByExperience[node.choice] = []
            }
            _nodesByExperience[node.choice]!.push(node)
        })

        links.forEach(link => {
            if (!_linksByExperience[link.source.choice]) {
                _linksByExperience[link.source.choice] = {
                    experience: link.source.choice,
                    links: [],
                }
            }

            _linksByExperience[link.source.choice]!.links.push(link)
        })

        _years.sort((a, b) => a.year - b.year)

        const _startNodes: SankeyNodeDatum[] = []
        const _endNodes: SankeyNodeDatum[] = []
        const firstYear = _years[0]
        const lastYear = _years[_years.length - 1]
        nodes.forEach(node => {
            if (node.year === firstYear.year) {
                _startNodes.push(node)
            }
            if (node.year === lastYear.year) {
                _endNodes.push(node)
            }
        })

        return {
            years: _years,
            nodesByChoice: _nodesByExperience,
            startNodes: _startNodes,
            endNodes: _endNodes,
            linksByExperience: Object.values(_linksByExperience),
        }
    }, [nodes, links])

    const currentLinks = useMemo(() =>
        linksByExperience.find(link => link.experience === currentExperience),
        [linksByExperience, currentExperience]
    )

    return (
        <>
            <YearsLegend years={years} />
            <LinksBackground links={links} />
            <Nodes
                nodes={nodes}
                currentExperience={currentExperience}
                setCurrentExperience={setCurrentExperience}
            />
            <LinkPercentages links={currentLinks!.links} />
        </>
    )
}