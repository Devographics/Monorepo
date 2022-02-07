import React from 'react'
import styled, { useTheme } from 'styled-components'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
import { ToolsExperienceToolData } from 'core/survey_api/tools'

const customImages = {
    testing_library: 'png',
    tsc: 'svg',
    npm_workspaces: 'svg',
    capacitor: 'svg',
    yarn_workspaces: 'png',
    reactnative: 'png',
    lerna: 'png',
    cordova: 'jpg',
    vuejs: 'svg'
}

interface TierItemData extends ToolsExperienceToolData {
    satisfactionRatio: number
    userCount: number
    color: string
    total: number
}

export interface TierProps {
    letter: string
    lowerBound: number
    upperBound: number
    items: TierItemData[]
    index: number
    total: number
}

export interface TierListProps {
    data: TierProps[]
    total: number
}

const maxRadius = 70
const minRadius = 30
const getRadius = (userCount: number, total: number) => {
    const ratio = userCount / total
    const range = maxRadius - minRadius
    return minRadius + range * ratio
}

const TierListChart = ({ data, total }: TierListProps) => {
    return (
        <Table>
            {data.map((tier, index) => (
                <Tier {...tier} key={tier.letter} index={index} total={total} />
            ))}
        </Table>
    )
}

const Tier = ({ letter, items, lowerBound, upperBound, index, total }: TierProps) => {
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
                        <TierItem {...item} key={item.id} total={total} />
                    ))}
                </TierItemsInner>
            </TierItems>
        </Row>
    )
}

const TierItem = ({ id, entity, satisfactionRatio, userCount, color, total }: TierItemData) => {
    const imageSrc = customImages[id]
        ? `/images/logos/${id}.${customImages[id]}`
        : `https://bestofjs.org/logos/${id}.svg`

    return (
        <Link color={color}>
            <ColorWrapper color={color}>
                <ImageWrapper>
                    <Image
                        // src={`/images/logos/${id}.svg`}
                        width="100%"
                        src={imageSrc}
                        // onError={(event) => event.target.style.display = 'none'}
                    />
                </ImageWrapper>
                <Ratio color={color} radius={getRadius(userCount, total)}>
                    <RatioNumber>{satisfactionRatio}%</RatioNumber>
                </Ratio>
            </ColorWrapper>
            <Name color={color}>{entity.name}</Name>
        </Link>
    )
}

const Table = styled.div``

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
// const UpperBound = styled(Bound)`
//     top: 0;
//     bottom: auto;
//     transform: translateX(-50%) translateY(-50%);
// `

const LowerBound = styled(Bound)`
    bottom: 0;
    top: auto;
    transform: translateX(-50%) translateY(50%);
`

const TierItems = styled.td`
    background: #333;
    padding: ${spacing(0.5)};
`

const TierItemsInner = styled.td`
    display: flex;
    flex-wrap: wrap;
    justify-content: top;
    gap: ${spacing(0.25)};
`

const Link = styled.div`
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;

    width: ${maxRadius + 20}px;
`

const ColorWrapper = styled.div`
    border: 3px solid ${({ color }) => color};
    background: white;
    padding: ${spacing(0.5)};
    display: grid;
    place-items: center;
`

const ImageWrapper = styled.div`
    padding: 7px;
`

const Image = styled.img`
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
`

const Name = styled.span`
    background: ${({ color }) => color};
    text-align: center;
    font-weight: ${fontWeight('bold')};
    line-height: 1.2;
    width: 100%;
    padding: 2px 5px 5px 5px;
    font-size: ${fontSize('small')};
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
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
`

const RatioNumber = styled.span`
    line-height: 0;
    text-align: center;
    font-size: ${fontSize('small')};
`

export default TierListChart
