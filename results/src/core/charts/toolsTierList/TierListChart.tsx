import React from 'react'
import { useTheme } from 'styled-components'
import { useEntity } from 'core/helpers/entities'
import { QuestionData } from '@devographics/types'
import './TierListChart.scss'

interface CustomImagesList {
    [key: string]: 'png' | 'svg' | 'jpg' | 'webp'
}
const customImages: CustomImagesList = {
    testing_library: 'png',
    yarn_workspaces: 'png',
    reactnative: 'png',
    lerna: 'png',
    cordova: 'jpg',
    selenium: 'png',
    hono: 'webp',
    tsup: 'webp',
    koa: 'webp'
}

type ToolsSectionId = string

export interface TierItemData extends QuestionData {
    satisfactionRatio: number
    userCount: number
    color: string
    total?: number
    sectionId?: ToolsSectionId
}

export interface TierListProps {
    data: TierData[]
    currentCategory: ToolsSectionId | null
}

export interface TierData {
    letter: string
    lowerBound: number
    upperBound: number
    items: TierItemData[]
    index: number
    // total: number
}

export interface TierProps extends TierData {
    currentCategory: ToolsSectionId | null
}

export interface TierItemProps extends TierItemData {
    currentCategory: ToolsSectionId | null
}

export const TierListChart = ({ data, currentCategory }: TierListProps) => {
    return (
        <div className="tier-list-chart">
            {data.map((tier, index) => (
                <Tier {...tier} key={tier.letter} index={index} currentCategory={currentCategory} />
            ))}
        </div>
    )
}

const Tier = ({ letter, items, lowerBound, upperBound, index, currentCategory }: TierProps) => {
    const theme = useTheme()
    const color = theme.colors.tiers[index]
    return (
        <div className="tier-row">
            <div className="tier-letter" style={{ '--letterColor': color }}>
                <div className="tier-letter-inner">{letter}</div>
                {/* {index === 0 && <UpperBound>{upperBound}%</UpperBound>} */}
                {lowerBound !== 0 && (
                    <div className="tier-bound tier-bound-lower">{lowerBound}%</div>
                )}
            </div>
            <div className="tier-items">
                <div className="tier-items-inner">
                    {items.map(item => (
                        <TierItem {...item} key={item.id} currentCategory={currentCategory} />
                    ))}
                </div>
            </div>
        </div>
    )
}

const TierItem = ({
    id,
    entity: entityProp,
    satisfactionRatio,
    color,
    sectionId,
    currentCategory
}: TierItemProps) => {
    const imageSrc = `${process.env.GATSBY_ASSETS_URL}/projects/${id}.${
        customImages[id] ? customImages[id] : 'svg'
    }`

    const isHighlighted = currentCategory ? currentCategory === sectionId : true

    const entity = entityProp || useEntity(id)

    return (
        <div
            className={`tier-item-link tier-item-link-${isHighlighted ? 'highlighted' : ''}`}
            style={{ '--itemColor': color }}
        >
            <div className="tier-item-color-wrapper">
                <a className="tier-item-image-wrapper" href={entity.homepage?.url}>
                    <img
                        className="tier-item-image"
                        // src={`/images/logos/${id}.svg`}
                        width="100%"
                        src={imageSrc}
                        // onError={(event) => event.target.style.display = 'none'}
                    />
                </a>
                <span className="tier-item-ratio">
                    <span className="tier-item-ratio-number">{satisfactionRatio}%</span>
                </span>
            </div>
            <a className="tier-item-name" href={entity.homepage?.url} color={color}>
                {entity?.name}
            </a>
        </div>
    )
}

export default TierListChart
