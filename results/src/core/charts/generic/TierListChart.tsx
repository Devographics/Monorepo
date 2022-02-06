import React, { useState } from 'react'
import styled, { useTheme } from 'styled-components'
import Block from 'core/blocks/block/BlockVariant'
import compact from 'lodash/compact'
import round from 'lodash/round'
import get from 'lodash/get'
import { useI18n } from 'core/i18n/i18nContext'
import ChartContainer from 'core/charts/ChartContainer'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import variables from 'Config/variables.yml'
import T from 'core/i18n/T'
import { getTableData } from 'core/helpers/datatables'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
import { ToolsExperienceToolData, ToolExperienceBucket } from 'core/survey_api/tools'

const customImages = {
    testing_library: 'png',
    tsc: 'svg',
    npm_workspaces: 'svg',
    capacitor: 'svg',
    yarn_workspaces: 'png',
    reactnative: 'png',
    lerna: 'png',
    cordova: 'jpg',
    vuejs: 'svg',
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
        <table>
            <tbody>
                {data.map((tier, index) => (
                    <Tier {...tier} key={tier.letter} index={index} total={total} />
                ))}
            </tbody>
        </table>
    )
}

const Tier = ({ letter, items, lowerBound, upperBound, index, total }: TierProps) => {
    const theme = useTheme()
    const color = theme.colors.tiers[index]
    return (
        <tr>
            <Letter color={color}>
                <LetterInner>{letter}</LetterInner>
                {index === 0 && <UpperBound>{upperBound}%</UpperBound>}
                <LowerBound>{lowerBound}%</LowerBound>
            </Letter>
            <TierItems>
                <TierItemsInner>
                    {items.map(item => (
                        <TierItem {...item} key={item.id} total={total} />
                    ))}
                </TierItemsInner>
            </TierItems>
        </tr>
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

const Letter = styled.th`
    padding: ${spacing()};
    background: ${({ color }) => color};
    color: ${({ theme }) => theme.colors.textInverted};
`

const LetterInner = styled.div`
    position: relative;
`

const Bound = styled.div`
    position: absolute;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    background: ${({ theme }) => theme.colors.backgroundAlt};
    padding: 3px 8px;
    border-radius: 3px;
`
const UpperBound = styled(Bound)`
    top: 0;
`

const LowerBound = styled(Bound)`
    bottom: 0;
`

const TierItems = styled.td`
    background: #333;
    padding: ${spacing(0.5)};
`

const TierItemsInner = styled.td`
    display: flex;
    flex-wrap: wrap;
    justify-content: top;
    gap: ${spacing(0.75)};
`

const Link = styled.div`
    /* background: linear-gradient(#00000000, #00000022), ${({ color }) => color}; */
    /* background: ${({ color }) => color}; */
    /* background: ${({ theme }) => theme.colors.backgroundInverted}; */
    /* border: 5px solid ${({ color }) => color}; */
    /* white-space: nowrap; */
    /* width: ${maxRadius}; */
    /* height: 100px; */
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;

    width: ${maxRadius + 20}px;
`

const ColorWrapper = styled.div`
    /* background: ${({ color }) => color}; */
    border: 5px solid ${({ color }) => color};
    background: ${({ theme }) => theme.colors.backgroundInverted};
    padding: ${spacing(0.5)};
    display: grid;
    place-items: center;
`

const ImageWrapper = styled.div``

const Image = styled.img`
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    /* display: none; */
`

const Name = styled.span`
    /* color: ${({ color }) => color}; */
    /* position: relative; */
    text-align: center;
    font-weight: ${fontWeight('bold')};
    line-height: 1.2;
    width: 100%;
    padding: 5px;
    font-size: ${fontSize('small')};
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`
const Ratio = styled.span`
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translateY(-100%);
    display: grid;
    place-items: center;
    /* opacity: 0.3; */
    font-weight: ${fontWeight('bold')};
    /* text-shadow: 1px 1px #00000022; */
    z-index: 1;
    background: ${({ color }) => color};
    height: 30px;
    width: 30px;
    padding: 2px 4px;
    /* border-radius: 100%; */
    /* border-radius: 6px; */
    /* height: ${maxRadius}px; */
    /* width: ${maxRadius + 20}px; */
    /* background: #222; */
    /* display: none; */
`
const RatioInner = styled.span`
    /* line-height: 0; */
    text-align: center;
    /* color: ${({ theme }) => theme.colors.text}44; */
    /* background: ${({ color }) => color}; */

    /* border-radius: 100%; */
    /* border-radius: 4px; */
    /* height: ${({ radius }) => radius}px; */
    /* width: ${({ radius }) => radius}px; */
    /* font-size: ${({ radius }) => radius * 0.5}px; */
    /* transform: translateX(-20px); */

    /* display: grid; */
    /* place-items: center; */
`

const RatioNumber = styled.span`
    text-align: center;
    font-size: ${fontSize('small')};
`

export default TierListChart
