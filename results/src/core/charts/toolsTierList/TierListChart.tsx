import React from 'react'
import styled, { useTheme } from 'styled-components'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
import { useEntity } from 'core/helpers/entities'
import { QuestionData } from '@devographics/types'

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
        <Table>
            {data.map((tier, index) => (
                <Tier {...tier} key={tier.letter} index={index} currentCategory={currentCategory} />
            ))}
        </Table>
    )
}

const Table = styled.div``

const Tier = ({ letter, items, lowerBound, upperBound, index, currentCategory }: TierProps) => {
    const theme = useTheme()
    const color = theme.colors.tiers[index]
    return (
        <Row>
            <Letter color={color}>
                <LetterInner>{letter}</LetterInner>
                {/* {index === 0 && <UpperBound>{upperBound}%</UpperBound>} */}
                {lowerBound !== 0 && <LowerBound>{lowerBound}%</LowerBound>}
            </Letter>
            <TierItems>
                <TierItemsInner>
                    {items.map(item => (
                        <TierItem {...item} key={item.id} currentCategory={currentCategory} />
                    ))}
                </TierItemsInner>
            </TierItems>
        </Row>
    )
}

const Row = styled.div`
    display: grid;
    grid-template-columns: 50px 1fr;
    column-gap: 5px;
    margin-bottom: 5px;
`
const Letter = styled.div`
    background: ${({ color }) => color};
    color: ${({ theme }) => theme.colors.textInverted};
    height: 100%;
    display: grid;
    place-items: center;
    position: relative;
    padding: ${spacing()};
`

const LetterInner = styled.div`
    text-align: center;
    font-weight: ${fontWeight('bold')};
`

const Bound = styled.div`
    position: absolute;
    left: 50%;
    border: 4px solid ${({ theme }) => theme.colors.background};
    background: ${({ theme }) => theme.colors.backgroundInverted};
    padding: 1px 4px;
    border-radius: 3px;
    z-index: 10;
    font-size: ${fontSize('smaller')};
`

const LowerBound = styled(Bound)`
    bottom: 0;
    top: auto;
    transform: translateX(-50%) translateY(50%);
`

const TierItems = styled.div`
    background: #333;
    padding: ${spacing(0.5)};
`

const TierItemsInner = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(60px, 90px));
    /* display: flex; */
    /* flex-wrap: wrap; */
    /* justify-content: top; */
    /* gap: ${spacing(0.25)}; */
    column-gap: ${spacing(0.25)};
    row-gap: ${spacing(0.25)};
`

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
        <Link color={color} isHighlighted={isHighlighted}>
            <ColorWrapper color={color}>
                <ImageWrapper href={entity.homepage?.url}>
                    <Image
                        // src={`/images/logos/${id}.svg`}
                        width="100%"
                        src={imageSrc}
                        // onError={(event) => event.target.style.display = 'none'}
                    />
                </ImageWrapper>
                <Ratio color={color}>
                    <RatioNumber>{satisfactionRatio}%</RatioNumber>
                </Ratio>
            </ColorWrapper>
            <Name href={entity.homepage?.url} color={color}>
                {entity?.name}
            </Name>
        </Link>
    )
}

const Link = styled.div`
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
    /* width: 90px; */
    opacity: ${({ isHighlighted }) => (isHighlighted ? 1 : 0.2)};
    transition: opacity ease-out 300ms;
    @media ${mq.small} {
        /* width: 60px; */
    }
`

const ColorWrapper = styled.div`
    border: 3px solid ${({ color }) => color};
    background: white;
    padding: ${spacing(0.5)};
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 1 / 1;
`

const ImageWrapper = styled.a`
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    padding: 7px;
    @media ${mq.small} {
        padding: 1px;
    }
`

const Image = styled.img`
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
`

const Name = styled.a`
    background: ${({ color }) => color}cc;
    text-align: center;
    font-weight: ${fontWeight('bold')};
    line-height: 1.2;
    width: 100%;
    padding: 2px 5px 5px 5px;
    font-size: ${fontSize('small')};
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    &,
    &:link,
    &:visited {
        color: var(--textColor);
    }
`

const Ratio = styled.span`
    position: absolute;
    top: 0;
    right: 0;
    display: grid;
    place-items: center;
    font-weight: ${fontWeight('bold')};
    z-index: 1;
    background: ${({ color }) => color};
    height: 30px;
    width: 30px;
    padding: 2px 4px;
    border-radius: 0 0 0 3px;
    @media ${mq.small} {
        height: 24px;
        width: 24px;
        padding: 2px 2px;
    }
`

const RatioNumber = styled.span`
    line-height: 0;
    text-align: center;
    font-size: ${fontSize('small')};
    @media ${mq.small} {
        font-size: ${fontSize('smaller')};
    }
`

export default TierListChart
