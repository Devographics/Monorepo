import React, { useEffect, useRef, useState } from 'react'
import { useI18n } from '@devographics/react-i18n'
import { CorrelationItem, CorrelationStrength } from '@devographics/types'
import { getItemLabel } from 'core/helpers/labels'
import { getQuestionById } from 'core/helpers/options'
import { usePageContext } from 'core/helpers/pageContext'
import T from 'core/i18n/T'
import { BlockVariantDefinition } from 'core/types'
import { getQuestionLabel } from '../helpers/labels'
import {
    formatCorrelation,
    getCorrelationKey,
    getHighlight,
    scrollToCorrelationItem
} from './helpers'
import { CorrelationExpandedProps, CorrelationHighlightProps, CorrelationProps } from './types'
import {
    getBandBoundaries,
    getSpectrumBands,
    getSpectrumExtent,
    getSpectrumGroups,
    getTicks,
    getXPosition
} from './spectrumHelpers'

/*

Correlation spectrum: every correlation of the question placed on a single
horizontal axis, from the strongest negative correlation on the left to the
strongest positive one on the right, with 0 in the middle.

Nodes that would overlap are gathered into groups: the axis is cut into bins of
`groupStep` (0.1 by default: 0.3 to 0.4, 0.4 to 0.5…) and every correlation
falling in the same bin shares one group, drawn at the middle of the bin. A
group shows its contents on hover (styling's job), and is marked active when
the correlation currently highlighted elsewhere belongs to it.

Only markup is generated here. Groups, nodes and ticks carry CSS variables for
the stylesheet to use:

- `--xPosition`: position along the axis, from 0 (left edge) to 100 (right
  edge), with 50 being a correlation of 0. For a group, the middle of its bin;
  for a node, its own exact value
- `--correlation`: the signed correlation at that position
- `--count`: for groups, how many nodes they contain
- `--start`, `--end`, `--width`: for legend bands, their extent along the axis,
  in the same 0 to 100 units as `--xPosition`
- `--moderateNegative`, `--moderatePositive`, `--strongNegative`… : on the axis,
  where each strength band begins on either side of 0 (in the same units), for
  the gradient stops

*/

// the axis always extends to at least ±0.5, and to the next multiple of this step beyond
export const EXTENT_STEP = 0.25

// a tick every TICK_STEP, labelled every LABEL_STEP (a multiple of TICK_STEP)
export const TICK_STEP = 0.05
export const LABEL_STEP = 0.25
export const MIN_EXTENT = 0.5

/*

Width of the bins nodes are grouped into, in correlation points. Bins start and
end on ticks and groups are drawn in the middle of their bin, so a group only
sits between two ticks if the step is an odd multiple of TICK_STEP (0.05, 0.15,
0.25…); an even multiple (0.1, 0.2…) puts every group on a tick.

*/
export const DEFAULT_GROUP_STEP = TICK_STEP

export type SpectrumNode = {
    correlation: CorrelationItem
    xPosition: number
}

export type SpectrumGroup = {
    id: string
    // bin number: the group covers [bin * step, (bin + 1) * step)
    bin: number
    // middle of the bin, where the group is drawn
    center: number
    xPosition: number
    // strongest first
    nodes: SpectrumNode[]
}

export type SpectrumBand = {
    strength: CorrelationStrength
    // "neutral" is the weak band straddling 0
    direction: 'negative' | 'neutral' | 'positive'
    // correlation values, start < end
    start: number
    end: number
}

export type SpectrumStyle = React.CSSProperties & Record<`--${string}`, number>

export const CorrelationsSpectrum = (
    props: CorrelationProps & CorrelationHighlightProps & { groupStep?: number }
) => {
    const { correlations, block, activeKey, setActiveKey, groupStep = DEFAULT_GROUP_STEP } = props
    const [expanded, setExpanded] = useState<string | null>(null)

    if (correlations.length === 0) {
        return null
    }
    const extent = getSpectrumExtent(correlations)
    const groups = getSpectrumGroups(correlations, extent, groupStep)
    const style: SpectrumStyle = { '--extent': extent, '--groupStep': groupStep }
    return (
        <div className="correlations-spectrum" style={style}>
            <div className="correlations-spectrum-inner">
                {/* <CorrelationsSpectrumPoles /> */}
                <CorrelationsSpectrumAxis extent={extent} />
                <CorrelationsSpectrumTicks extent={extent} />
                <CorrelationsSpectrumNodes
                    groups={groups}
                    groupStep={groupStep}
                    block={block}
                    activeKey={activeKey}
                    setActiveKey={setActiveKey}
                    expanded={expanded}
                    setExpanded={setExpanded}
                />
                <CorrelationsSpectrumLegend extent={extent} />
            </div>
        </div>
    )
}

const CorrelationsSpectrumNodes = (
    props: {
        groups: SpectrumGroup[]
        groupStep: number
        block: BlockVariantDefinition
    } & CorrelationExpandedProps
) => {
    const { groups } = props
    return (
        <div className="correlations-spectrum-nodes">
            {groups.map(group => (
                <CorrelationsSpectrumNodeGroup key={group.bin} group={group} {...props} />
            ))}
        </div>
    )
}

const CorrelationsSpectrumLegend = ({ extent }: { extent: number }) => (
    <div className="correlations-spectrum-legend">
        {getSpectrumBands(extent).map(band => (
            <CorrelationsSpectrumBand
                key={`${band.direction}-${band.strength}`}
                band={band}
                extent={extent}
            />
        ))}
    </div>
)

const CorrelationsSpectrumBand = ({ band, extent }: { band: SpectrumBand; extent: number }) => {
    const { strength, direction, start, end } = band
    const startPosition = getXPosition(start, extent)
    const endPosition = getXPosition(end, extent)
    const style: SpectrumStyle = {
        '--start': startPosition,
        '--end': endPosition,
        '--width': Math.round((endPosition - startPosition) * 10) / 10
    }
    return (
        <div
            className={`correlations-spectrum-band correlations-spectrum-band-${strength} correlations-spectrum-band-${direction}`}
            style={style}
        >
            <span className="correlations-spectrum-band-label">
                <T k={`correlations.strength.${strength}`} />
            </span>
        </div>
    )
}

/*

A bin of the axis and the nodes that fall in it. The marker stands for the
whole group; the nodes list is its expanded state. The group is active when the
highlighted correlation (hovered here or in the lists) is one of its nodes.

*/
const CorrelationsSpectrumNodeGroup = ({
    group,
    groupStep,
    block,
    activeKey,
    setActiveKey,
    expanded,
    setExpanded
}: {
    group: SpectrumGroup
    groupStep: number
    block: BlockVariantDefinition
} & CorrelationExpandedProps) => {
    const { bin, center, xPosition, nodes, id } = group
    const isActive = nodes.some(node => getCorrelationKey(node.correlation) === activeKey)
    const direction = center < 0 ? 'negative' : 'positive'
    const style: SpectrumStyle = {
        '--xPosition': xPosition,
        '--correlation': center,
        '--count': nodes.length
    }
    const range = `${formatCorrelation(bin * groupStep)} – ${formatCorrelation(
        (bin + 1) * groupStep
    )}`
    const isExpanded = expanded === id
    const handleClick = () => {
        setExpanded(isExpanded ? null : id)
    }

    // collapse when the user presses anywhere outside this group. Uses pointerdown
    // rather than click so that clicking another group's marker collapses this one
    // first and that group's own click handler then expands it (with click, the
    // document listener would run after it and immediately collapse it again).
    // The listener only exists while this group is expanded.
    const groupRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!isExpanded) {
            return
        }
        const handlePointerDown = (event: PointerEvent) => {
            if (!groupRef.current?.contains(event.target as Node)) {
                setExpanded(null)
            }
        }
        document.addEventListener('pointerdown', handlePointerDown)
        return () => document.removeEventListener('pointerdown', handlePointerDown)
    }, [isExpanded, setExpanded])

    return (
        <div
            ref={groupRef}
            data-id={id}
            className={[
                'correlations-spectrum-nodegroup',
                `correlations-spectrum-nodegroup-${direction}`,
                nodes.length === 1 && 'correlations-spectrum-nodegroup-single',
                isExpanded && 'correlations-spectrum-nodegroup-expanded',
                isActive && 'correlations-spectrum-nodegroup-active'
            ]
                .filter(Boolean)
                .join(' ')}
            style={style}
        >
            <button onClick={handleClick} className="correlations-spectrum-nodegroup-marker">
                <span className="correlations-spectrum-nodegroup-count">{nodes.length}</span>
                <span className="sr-only">{range}</span>
            </button>

            <div
                className={`correlations-spectrum-nodegroup-nodes correlations-spectrum-nodegroup-nodes-${direction}`}
            >
                {nodes.map(node => (
                    <CorrelationsSpectrumNode
                        key={getCorrelationKey(node.correlation)}
                        node={node}
                        block={block}
                        activeKey={activeKey}
                        setActiveKey={setActiveKey}
                    />
                ))}
            </div>
        </div>
    )
}

const CorrelationsSpectrumAxis = ({ extent }: { extent: number }) => (
    <div className="correlations-spectrum-axis" style={getBandBoundaries(extent)} />
)

const CorrelationsSpectrumTicks = ({ extent }: { extent: number }) => (
    <div className="correlations-spectrum-axis-ticks">
        {getTicks(extent).map(({ value, isLabelled }) => (
            <CorrelationsSpectrumTick
                key={value}
                value={value}
                extent={extent}
                isLabelled={isLabelled}
            />
        ))}
    </div>
)

const CorrelationsSpectrumTick = ({
    value,
    extent,
    isLabelled
}: {
    value: number
    extent: number
    isLabelled: boolean
}) => {
    const style: SpectrumStyle = {
        '--xPosition': getXPosition(value, extent),
        '--correlation': value
    }
    const modifier = value === 0 ? 'zero' : value < 0 ? 'negative' : 'positive'
    return (
        <div
            className={`correlations-spectrum-tick correlations-spectrum-tick-${modifier} correlations-spectrum-tick-${
                isLabelled ? 'major' : 'minor'
            }`}
            style={style}
        >
            {isLabelled && (
                <span className="correlations-spectrum-tick-label">
                    {value === 0 ? '0' : formatCorrelation(value)}
                </span>
            )}
        </div>
    )
}

const CorrelationsSpectrumNode = ({
    node,
    block,
    activeKey,
    setActiveKey
}: {
    node: SpectrumNode
    block: BlockVariantDefinition
} & CorrelationHighlightProps) => {
    const { correlation, xPosition } = node
    const { isActive, handlers } = getHighlight(correlation, { activeKey, setActiveKey })
    const { direction, strength, kind2 } = correlation
    const style: SpectrumStyle = {
        '--xPosition': xPosition,
        '--correlation': correlation.correlation
    }
    return (
        <div
            className={`correlations-spectrum-node correlations-spectrum-node-${direction} correlations-spectrum-node-${strength} correlations-spectrum-node-${kind2} ${
                isActive ? 'correlations-spectrum-node-active' : ''
            }`}
            style={style}
            onClick={event =>
                scrollToCorrelationItem(event.currentTarget, getCorrelationKey(correlation))
            }
            {...handlers}
        >
            <CorrelationsSpectrumNodeLabel correlation={correlation} block={block} />
        </div>
    )
}

/*

What the node stands for: an answer (with its question underneath), or a whole
question as a scale or a count of selected items.

*/
const CorrelationsSpectrumNodeLabel = ({
    correlation,
    block
}: {
    correlation: CorrelationItem
    block: BlockVariantDefinition
}) => {
    const { currentEdition } = usePageContext()
    const { getString } = useI18n()
    const { kind2, questionId2, optionId2 } = correlation

    const question = getQuestionById(currentEdition, questionId2)
    const questionName = question
        ? getQuestionLabel({ getString, question, block }).questionName
        : questionId2

    let primaryLabel: string | undefined
    let secondaryLabel: string | undefined
    if (kind2 === 'option' && optionId2) {
        primaryLabel = questionName
        secondaryLabel = getItemLabel({
            id: optionId2,
            getString,
            i18nNamespace: questionId2
        })?.shortLabel
    } else {
        primaryLabel = questionName
        secondaryLabel = getString(
            kind2 === 'cardinality'
                ? 'correlations.cardinality.subheading'
                : 'correlations.trend.subheading'
        )?.t
    }

    return (
        <>
            <span className="correlations-spectrum-node-label">
                <span className="correlations-spectrum-node-label-primary">{primaryLabel}</span>{' '}
                <span>&gt;</span>{' '}
                {secondaryLabel && (
                    <span className="correlations-spectrum-node-label-secondary">
                        {secondaryLabel}
                    </span>
                )}
            </span>
            <span className="correlations-spectrum-node-value">
                {formatCorrelation(correlation.correlation)}
            </span>
        </>
    )
}
