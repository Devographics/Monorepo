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
                <PeopleItem key={b.id} {...b} index={index} />
            ))}
        </Block>
    )
}

const PeopleItem = ({ index, count, entity, id, percentage_survey, percentage_question }) => {
    if (!entity) {
        return <div>no entity found for id {id}</div>
    }
    return (
        <Item_>
            <Index_>{index}</Index_>
            <Avatar entity={entity} />
            <Contents_>
                <Name_>{entity.name}</Name_>
            </Contents_>
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
        </Item_>
    )
}

const Item_ = styled.div`
    display: flex;
    gap: ${spacing()};
    margin-bottom: ${spacing()};
`

const Index_ = styled.div``

const Contents_ = styled.div``

const Name_ = styled.div``

const Links_ = styled.div``

const Data_ = styled.div``

const Count_ = styled.div``

const Dots_ = styled.div``

const Dot_ = styled.div``

export default HorizontalBarBlock
