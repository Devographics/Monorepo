import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { CORRELATION_STRENGTH_BANDS } from '@devographics/constants'
import { CorrelationItem, CorrelationStrength } from '@devographics/types'
import Tooltip from 'core/components/Tooltip'
import { getItemLabel } from 'core/helpers/labels'
import { getQuestionById } from 'core/helpers/options'
import { usePageContext } from 'core/helpers/pageContext'
import T from 'core/i18n/T'
import { BlockVariantDefinition } from 'core/types'
import { getQuestionLabel } from '../helpers/labels'
import { CorrelationItemComponent } from './CorrelationItemComponent'
import { formatCorrelation, getCorrelationKey, getHighlight } from './helpers'
import { CorrelationHighlightProps, CorrelationProps } from './types'

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
const EXTENT_STEP = 0.25

// a tick every TICK_STEP, labelled every LABEL_STEP (a multiple of TICK_STEP)
const TICK_STEP = 0.05
const LABEL_STEP = 0.25
const MIN_EXTENT = 0.5

/*

Width of the bins nodes are grouped into, in correlation points. Bins start and
end on ticks and groups are drawn in the middle of their bin, so a group only
sits between two ticks if the step is an odd multiple of TICK_STEP (0.05, 0.15,
0.25…); an even multiple (0.1, 0.2…) puts every group on a tick.

*/
export const DEFAULT_GROUP_STEP = TICK_STEP

type SpectrumNode = {
    correlation: CorrelationItem
    xPosition: number
}

type SpectrumGroup = {
    // bin number: the group covers [bin * step, (bin + 1) * step)
    bin: number
    // middle of the bin, where the group is drawn
    center: number
    xPosition: number
    // strongest first
    nodes: SpectrumNode[]
}

type SpectrumBand = {
    strength: CorrelationStrength
    // "neutral" is the weak band straddling 0
    direction: 'negative' | 'neutral' | 'positive'
    // correlation values, start < end
    start: number
    end: number
}

type SpectrumStyle = React.CSSProperties & Record<`--${string}`, number>

/*

Symmetric extent of the axis, rounded up to the next step, so that 0 always
sits in the middle and the strongest correlation stays close to an edge.

*/
export const getSpectrumExtent = (correlations: CorrelationItem[]) => {
    const max = Math.max(0, ...correlations.map(c => Math.abs(c.correlation)))
    return Math.max(MIN_EXTENT, Math.ceil(max / EXTENT_STEP) * EXTENT_STEP)
}

// map a correlation within [-extent, extent] to a position within [0, 100]
export const getXPosition = (value: number, extent: number) =>
    Math.round(((value + extent) / (2 * extent)) * 1000) / 10

/*

Which bin a correlation falls in. Bins are measured out from 0 on both sides,
so a value and its opposite always land in mirror-image bins. A value sitting
exactly on an edge belongs to the bin nearer 0: with a step of 0.05, both 0.64
and 0.65 fall in (0.60, 0.65] and are drawn at 0.625, and -0.65 mirrors that at
-0.625. The ratio is rounded before rounding up so that floating point noise
can't push an exact edge into the next bin (0.65 / 0.05 = 13.000000000000002).

*/
export const getBin = (value: number, step: number) => {
    const ratio = Math.round((Math.abs(value) / step) * 1e6) / 1e6
    const magnitude = Math.max(0, Math.ceil(ratio) - 1)
    // negative bins are numbered so that `(bin + 0.5) * step` is still their middle
    return value < 0 ? -(magnitude + 1) : magnitude
}

export const getSpectrumGroups = (
    correlations: CorrelationItem[],
    extent: number,
    step: number = DEFAULT_GROUP_STEP
): SpectrumGroup[] => {
    const nodesByBin = new Map<number, SpectrumNode[]>()
    for (const correlation of correlations) {
        const bin = getBin(correlation.correlation, step)
        const node = { correlation, xPosition: getXPosition(correlation.correlation, extent) }
        nodesByBin.set(bin, [...(nodesByBin.get(bin) ?? []), node])
    }
    return [...nodesByBin.entries()]
        .sort(([a], [b]) => a - b)
        .map(([bin, nodes]) => {
            const center = Math.round((bin + 0.5) * step * 1000) / 1000
            return {
                bin,
                center,
                xPosition: getXPosition(center, extent),
                nodes: nodes.sort(
                    (a, b) =>
                        Math.abs(b.correlation.correlation) - Math.abs(a.correlation.correlation)
                )
            }
        })
}

/*

The strength bands laid out along the axis, left to right: very strong,
strong, moderate, weak (straddling 0), then the same again mirrored. Thresholds
come from the same shared constant the API uses to label correlations, so a band
always matches the labels on the cards. Bands are cut off at the axis extent,
and a band lying entirely beyond it is left out.

*/
export const getSpectrumBands = (extent: number): SpectrumBand[] => {
    // weakest threshold first: moderate, strong, very strong
    const thresholds = [...CORRELATION_STRENGTH_BANDS].reverse()
    const positive: SpectrumBand[] = thresholds
        .map(([strength, lowerBound], index) => ({
            strength,
            direction: 'positive' as const,
            start: lowerBound,
            end: Math.min(thresholds[index + 1]?.[1] ?? extent, extent)
        }))
        .filter(band => band.start < extent)
    const weakBound = Math.min(thresholds[0][1], extent)
    const weak: SpectrumBand = {
        strength: 'weak',
        direction: 'neutral',
        start: -weakBound,
        end: weakBound
    }
    const negative = [...positive].reverse().map(band => ({
        ...band,
        direction: 'negative' as const,
        start: -band.end,
        end: -band.start
    }))
    return [...negative, weak, ...positive]
}

/*

Ticks from one end of the axis to the other. Values are computed from an integer
count rather than by adding the step repeatedly, so floating point error can't
accumulate and make a tick miss a label boundary.

*/
const getTicks = (extent: number) => {
    const count = Math.round((2 * extent) / TICK_STEP)
    return Array.from({ length: count + 1 }, (_, index) => {
        const value = Math.round((-extent + index * TICK_STEP) * 1000) / 1000
        const ratio = value / LABEL_STEP
        return { value, isLabelled: Math.abs(ratio - Math.round(ratio)) < 1e-9 }
    })
}

export const CorrelationsSpectrum = (
    props: CorrelationProps & CorrelationHighlightProps & { groupStep?: number }
) => {
    const { correlations, block, activeKey, setActive, groupStep = DEFAULT_GROUP_STEP } = props
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
                    setActive={setActive}
                />
                <CorrelationsSpectrumLegend extent={extent} />
            </div>
        </div>
    )
}

const CorrelationsSpectrumNodes = ({
    groups,
    groupStep,
    block,
    activeKey,
    setActive
}: {
    groups: SpectrumGroup[]
    groupStep: number
    block: BlockVariantDefinition
} & CorrelationHighlightProps) => (
    <div className="correlations-spectrum-nodes">
        {groups.map(group => (
            <CorrelationsSpectrumNodeGroup
                key={group.bin}
                group={group}
                groupStep={groupStep}
                block={block}
                activeKey={activeKey}
                setActive={setActive}
            />
        ))}
    </div>
)

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
    setActive
}: {
    group: SpectrumGroup
    groupStep: number
    block: BlockVariantDefinition
} & CorrelationHighlightProps) => {
    const { bin, center, xPosition, nodes } = group
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
    return (
        <div
            className={[
                'correlations-spectrum-nodegroup',
                `correlations-spectrum-nodegroup-${direction}`,
                nodes.length === 1 && 'correlations-spectrum-nodegroup-single',
                isActive && 'correlations-spectrum-nodegroup-active'
            ]
                .filter(Boolean)
                .join(' ')}
            style={style}
        >
            <button className="correlations-spectrum-nodegroup-marker">
                <span className="correlations-spectrum-nodegroup-count">{nodes.length}</span>
                <span className="sr-only">{range}</span>
            </button>
            <div className="correlations-spectrum-nodegroup-nodes">
                {nodes.map(node => (
                    <CorrelationsSpectrumNode
                        key={getCorrelationKey(node.correlation)}
                        node={node}
                        block={block}
                        activeKey={activeKey}
                        setActive={setActive}
                    />
                ))}
            </div>
        </div>
    )
}

const CorrelationsSpectrumPoles = () => (
    <div className="correlations-spectrum-poles">
        {(['negative', 'positive'] as const).map(direction => (
            <div
                key={direction}
                className={`correlations-spectrum-pole correlations-spectrum-pole-${direction}`}
            >
                <T k={`correlations.direction.${direction}.title`} />
            </div>
        ))}
    </div>
)

/*

Where each strength band begins on either side of 0, as CSS variables named
after the band: `--moderatePositive` is where +0.15 sits, `--moderateNegative`
where -0.15 sits, and so on for every band in CORRELATION_STRENGTH_BANDS. A
threshold beyond the axis extent lands outside 0-100, which gradient stops
handle fine.

*/
export const getBandBoundaries = (extent: number) =>
    Object.fromEntries(
        CORRELATION_STRENGTH_BANDS.flatMap(([strength, lowerBound]) => {
            // very_strong -> veryStrong
            const name = strength.replace(/_(\w)/g, (_, letter: string) => letter.toUpperCase())
            return [
                [`--${name}Negative`, getXPosition(-lowerBound, extent)],
                [`--${name}Positive`, getXPosition(lowerBound, extent)]
            ]
        })
    ) as SpectrumStyle

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
    setActive
}: {
    node: SpectrumNode
    block: BlockVariantDefinition
} & CorrelationHighlightProps) => {
    const { correlation, xPosition } = node
    const { isActive, handlers } = getHighlight(correlation, { activeKey, setActive })
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
            {...handlers}
        >
            <Tooltip
                showBorder={false}
                trigger={
                    <button className="correlations-spectrum-node-marker">
                        <span className="sr-only">
                            {formatCorrelation(correlation.correlation)}
                        </span>
                    </button>
                }
                contents={
                    <div className="correlations-spectrum-node-tooltip">
                        <CorrelationItemComponent
                            correlation={correlation}
                            block={block}
                            index={0}
                        />
                    </div>
                }
            />
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
        primaryLabel = getItemLabel({
            id: optionId2,
            getString,
            i18nNamespace: questionId2
        })?.shortLabel
        secondaryLabel = questionName
    } else {
        primaryLabel = questionName
        secondaryLabel = getString(
            kind2 === 'cardinality'
                ? 'correlations.cardinality.subheading'
                : 'correlations.trend.subheading'
        )?.t
    }

    return (
        <div className="correlations-spectrum-node-label">
            <span className="correlations-spectrum-node-label-value">
                {formatCorrelation(correlation.correlation)}
            </span>
            <span className="correlations-spectrum-node-label-primary">{primaryLabel}</span>
            {secondaryLabel && (
                <span className="correlations-spectrum-node-label-secondary">{secondaryLabel}</span>
            )}
        </div>
    )
}
