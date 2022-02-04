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

interface TierItemData extends ToolsExperienceToolData {
    satisfactionRatio: number
    color: string
}

export interface TierProps {
    letter: string
    lowerBound: number
    upperBound: number
    items: TierItemData[]
    index: number
}

export interface TierListProps {
    data: TierProps[]
}

const TierListChart = ({ data }: TierListProps) => {
    return (
        <table>
            <tbody>
                {data.map((tier, index) => (
                    <Tier {...tier} key={tier.letter} index={index} />
                ))}
            </tbody>
        </table>
    )
}

const Tier = ({ letter, items, lowerBound, upperBound, index }: TierProps) => {
    const theme = useTheme()
    const color = theme.colors.tiers[index]
    return (
        <tr>
            <Letter color={color}>{letter}</Letter>
            <TierItems>
                <TierItemsInner>
                    {items.map(item => (
                        <TierItem {...item} key={item.id} />
                    ))}
                </TierItemsInner>
            </TierItems>
        </tr>
    )
}

const TierItem = ({ entity, satisfactionRatio, color }: TierItemData) => {
    return (
        <Link color={color}>
            <Ratio color={color}>
                <RatioInner>{satisfactionRatio}</RatioInner>
            </Ratio>
            <Name color={color}>{entity.name}</Name>

        </Link>
    )
}

const Letter = styled.th`
    padding: ${spacing()};
    background: ${({ color }) => color};
    color: ${({ theme }) => theme.colors.textInverted};
`

const TierItems = styled.td`
    background: #333;
    padding: ${spacing(0.5)};
`

const TierItemsInner = styled.td`
    display: inline-flex;
    flex-wrap: wrap;
    gap: ${spacing(0.75)};
`

const Link = styled.div`
    /* background: linear-gradient(#00000000, #00000022), ${({ color }) => color}; */
    /* background: ${({ color }) => color}; */
    /* background: ${({ theme }) => theme.colors.backgroundInverted}; */
    /* border: 5px solid ${({ color }) => color}; */
    /* white-space: nowrap; */
    width: 80px;
    height: 100px;
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
`

const Name = styled.span`
    /* color: ${({ theme }) => theme.colors.textInverted}; */
    color: ${({ color }) => color};
    position: relative;
    z-index: 2;
    text-align: center;
    font-weight: ${fontWeight('bold')};
    line-height: 1.2;
    /* background: #ffffff99; */
    width: 100%;
    padding: 5px;
    font-size: ${fontSize('smallish')};
    /* text-shadow: 1px 1px #ffffff33; */
    transform: translateY(45px);

`
const Ratio = styled.span`
    background: ${({ color }) => color};

    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.colors.text}44;
    /* opacity: 0.3; */
    font-weight: ${fontWeight('bold')};
    /* text-shadow: 1px 1px #00000022; */
    z-index: 1;
    border-radius: 100%;
    height: 80px;
/* display: none; */

`
const RatioInner = styled.span`
    font-size: 50px;
    line-height: 0;
    text-align: center;
    /* transform: translateX(-20px); */
`

export default TierListChart
