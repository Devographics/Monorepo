import React, { useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { ResultsByYear, BlockComponentProps } from 'core/types'
import styled from 'styled-components'
import Avatar from 'core/components/Avatar'
import SocialLinks from 'core/blocks/people/SocialLinks'
import { spacing, mq, fontSize } from 'core/theme'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: ResultsByYear
}

const HorizontalBarBlock = ({
    block,
    data,
    controlledUnits,
    isCustom
}: HorizontalBarBlockProps) => {
    const {
        id,
        mode = 'relative',
        defaultUnits = 'count',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id,
        colorVariant
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const { facets, completion } = data
    const buckets = facets[0].buckets
    const { total } = completion

    console.log(buckets)

    return (
        <Block
            units={controlledUnits ?? units}
            setUnits={setUnits}
            data={data}
            tables={[
                getTableData({
                    data: buckets,
                    valueKeys: ['percentage_survey', 'percentage_question', 'count'],
                    translateData,
                    i18nNamespace: chartNamespace
                })
            ]}
            block={block}
            completion={completion}
        >
            {buckets.map((b, index) => (
                <PeopleItem key={b.id} {...b} index={index} maxCount={buckets[0].count} />
            ))}
        </Block>
    )
}

const PeopleItem = ({
    index,
    count,
    maxCount,
    entity,
    id,
    percentage_survey,
    percentage_question
}) => {
    if (!entity) {
        return <div>no entity found for id {id}</div>
    }
    return (
        <Item_>
            <Bar_>
                <BarInner_ style={{ width: `${Math.round((count * 100) / maxCount)}%` }} />
            </Bar_>
            <Main_>
                <Index_>#{index + 1}</Index_>

                <Contents_>
                    <Avatar entity={entity} size={40} />
                    <Name_>{entity.name}</Name_>
                    <Links_>
                        <SocialLinks entity={entity} />
                    </Links_>
                    <Data_>
                        <Count_>{count}</Count_>
                        <Dots_>
                            {/* {[...Array(count)].map((x, index) => (
                        <Dot_ key={index} />
                    ))} */}
                        </Dots_>
                    </Data_>
                </Contents_>
            </Main_>
        </Item_>
    )
}

const Item_ = styled.div`
    margin-bottom: ${spacing()};
    position: relative;
`

const Index_ = styled.div`
    margin-left: -40px;
    width: 40px;
    font-size: ${fontSize('large')};
`

const Bar_ = styled.div`
    background: rgba(255, 255, 255, 0.05);
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`

const BarInner_ = styled.div`
    background: rgba(255, 255, 255, 0.05);
    height: 100%;
`

const Main_ = styled.div`
    z-index: 2;
    position: relative;
    display: flex;
    align-items: center;
`

const Contents_ = styled.div`
    display: flex;
    gap: ${spacing()};
    padding: ${spacing(0.25)};
    align-items: center;
`

const Name_ = styled.div``

const Links_ = styled.div``

const Data_ = styled.div``

const Count_ = styled.div``

const Dots_ = styled.div``

const Dot_ = styled.div``

export default HorizontalBarBlock
