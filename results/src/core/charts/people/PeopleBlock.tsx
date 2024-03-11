import React, { useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
// import HorizontalBarChart from 'core/charts/horizontalBar/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import type { BlockComponentProps } from 'core/types'
import type { QuestionData } from '@devographics/types'
import styled from 'styled-components'
import Avatar from 'core/components/Avatar'
import SocialLinks from 'core/charts/people/SocialLinks'
import { spacing, mq, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import {
    LinkIcon,
    NpmIcon,
    TwitterIcon,
    GitHubIcon,
    MastodonIcon,
    YouTubeIcon,
    TwitchIcon,
    RSSIcon,
    BlogIcon
} from 'core/icons'
import DynamicDataLoader from 'core/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/filters/helpers'
import { MODE_GRID } from 'core/filters/constants'
import { useEntities } from 'core/helpers/entities'
import { NOT_APPLICABLE, NO_ANSWER } from '@devographics/constants'
import maxBy from 'lodash/maxBy.js'

export interface PeopleBlockProps extends BlockComponentProps {
    data: QuestionData
}

export const services = [
    {
        name: 'twitter',
        icon: TwitterIcon
    },
    {
        name: 'homepage',
        icon: LinkIcon
    },
    {
        name: 'blog',
        icon: BlogIcon
    },
    {
        name: 'rss',
        icon: RSSIcon
    },
    {
        name: 'github',
        icon: GitHubIcon
    },
    {
        name: 'npm',
        icon: NpmIcon
    },
    {
        name: 'mastodon',
        icon: MastodonIcon
    },
    {
        name: 'youtube',
        icon: YouTubeIcon
    },
    {
        name: 'twitch',
        icon: TwitchIcon
    }
]

/*

Only keep items that appear at least once (i.e. have a URL) for any of the entities in this question

*/
export const getRelevantServices = allEntities => {
    return services.filter(({ name }) => {
        return allEntities.some(e => e?.[name]?.url)
    })
}

const PeopleBlock = ({ block, data, controlledUnits, isCustom }: PeopleBlockProps) => {
    const chartData = data?.responses?.currentEdition
    if (!chartData) {
        return <div>PeopleBlock: No data found for block {block.id}</div>
    }
    const {
        id,
        mode = 'relative',
        defaultUnits = 'count',
        translateData,
        i18nNamespace = block.id,
        colorVariant
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const { buckets, completion } = chartData
    const { total } = completion

    const bucketEntities = buckets.map(b => b.entity).filter(b => !!b)
    const allEntities = useEntities()
    const entities = bucketEntities.length > 0 ? bucketEntities : allEntities

    const services = getRelevantServices(entities)

    const { chartFilters, setChartFilters, filterLegends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID] }
    })

    const defaultSeries = { name: 'default', data }

    return (
        <Block
            units={controlledUnits ?? units}
            setUnits={setUnits}
            data={chartData}
            tables={[
                getTableData({
                    data: buckets,
                    valueKeys: ['percentageSurvey', 'percentageQuestion', 'count'],
                    translateData,
                    i18nNamespace: i18nNamespace
                })
            ]}
            block={block}
            completion={completion}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
        >
            <DynamicDataLoader
                defaultSeries={defaultSeries}
                block={block}
                chartFilters={chartFilters}
                layout="grid"
                getChartData={getChartData}
            >
                <PeopleChart buckets={buckets} units={units} entities={entities} />
            </DynamicDataLoader>
        </Block>
    )
}

const getChartData = data => data

const PeopleChart = ({ buckets, units, entities }) => {
    const maxBucket = maxBy(buckets, b => b.count)
    const maxCount = maxBucket.count
    return (
        <Chart_>
            <Heading_>
                <HName_>
                    <T k="blocks.people.name" />
                </HName_>
                {/* <HLinks_>
<T k="blocks.people.social_links" />
</HLinks_> */}
                <HResponses_>
                    <T k="blocks.people.responses" />
                </HResponses_>
            </Heading_>
            <List_>
                {buckets.map((b, index) => (
                    <PeopleItem
                        key={b.id}
                        {...b}
                        index={index}
                        maxCount={maxCount}
                        units={units}
                        services={services}
                        entity={entities.find(e => e.id === b.id)}
                    />
                ))}
            </List_>
        </Chart_>
    )
}

const PeopleItem = ({
    index,
    count,
    maxCount,
    entity,
    id,
    percentageSurvey,
    percentageQuestion,
    units,
    services
}) => {
    const isTop10 = index < 10

    const avatarSize = 40

    const getNumber = () => {
        switch (units) {
            case 'percentageQuestion':
                return percentageQuestion + '%'

            case 'percentageSurvey':
                return percentageSurvey + '%'

            case 'count':
            default:
                return count
        }
    }

    if (id === NO_ANSWER) {
        return (
            <Item_ className={isTop10 ? 'top10' : ''}>
                <Bar_>
                    <BarInner_ style={{ width: `${Math.round((count * 100) / maxCount)}%` }} />
                </Bar_>
                <Index_>
                    <span>#{index + 1}</span>
                </Index_>
                <LabelContents_>
                    <Label_>
                        <T k="charts.no_answer" />
                    </Label_>

                    <Count_>{getNumber()}</Count_>
                </LabelContents_>
            </Item_>
        )
    }
    if (id === NOT_APPLICABLE) {
        return (
            <Item_ className={isTop10 ? 'top10' : ''}>
                <Bar_>
                    <BarInner_ style={{ width: `${Math.round((count * 100) / maxCount)}%` }} />
                </Bar_>
                <Index_>
                    <span>#{index + 1}</span>
                </Index_>
                <LabelContents_>
                    <Label_>
                        <T k="options.people.na" />
                    </Label_>
                    <Count_>{getNumber()}</Count_>
                </LabelContents_>
            </Item_>
        )
    }
    if (!entity) {
        return <div>no entity found for id {id}</div>
    }

    return (
        <Item_ className={isTop10 ? 'top10' : ''}>
            <Bar_>
                <BarInner_ style={{ width: `${Math.round((count * 100) / maxCount)}%` }} />
            </Bar_>
            <Index_>
                <span>#{index + 1}</span>
            </Index_>

            <Contents_>
                <Avatar entity={entity} size={avatarSize} />
                <Person_>
                    <Name_>{entity.name}</Name_>
                    <Links_>
                        <SocialLinks entity={entity} services={services} />
                    </Links_>
                </Person_>
                <Count_>{getNumber()}</Count_>
            </Contents_>
        </Item_>
    )
}

// const PeopleBar = ({ children}) => {
//     return (
//         <Item_ className={isTop10 ? 'top10' : ''}>
//             <Bar_>
//                 <BarInner_ style={{ width: `${Math.round((count * 100) / maxCount)}%` }} />
//             </Bar_>
//             <Index_>
//                 <span>#{index + 1}</span>
//             </Index_>

//             <Contents_>
//                 <Avatar entity={entity} size={avatarSize} />
//                 <Person_>
//                     <Name_>{entity.name}</Name_>
//                     <Links_>
//                         <SocialLinks entity={entity} services={services} />
//                     </Links_>
//                 </Person_>
//                 <Count_>{getNumber()}</Count_>
//             </Contents_>
//         </Item_>
//     )
// }

const Chart_ = styled.div``

const List_ = styled.div`
    display: grid;
`

const Item_ = styled.div`
    margin-bottom: ${spacing(0.5)};
    position: relative;
`

const Index_ = styled.div`
    position: absolute;
    left: -50px;
    width: 40px;
    text-align: right;
    font-size: ${fontSize('medium')};
    top: 0;
    bottom: 0;
    display: grid;
    place-items: center;
    .top10 & {
        /* font-size: ${fontSize('large')}; */
    }
    @media ${mq.small} {
        display: none;
    }
    span {
        display: block;
        width: 100%;
    }
`

const Bar_ = styled.div`
    /* background: rgba(255, 255, 255, 0.05); */
    background: ${({ theme }) => theme.colors.backgroundAlt};
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`

const BarInner_ = styled.div`
    background: linear-gradient(to right, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
    /* background: ${({ theme }) => theme.colors.backgroundAlt}; */
    height: 100%;
`

const Heading_ = styled.div`
    margin-bottom: ${spacing(0.5)};
    display: flex;
    justify-content: space-between;
`

const H_ = styled.h4`
    margin: 0;
`

const HName_ = styled(H_)``

const HLinks_ = styled(H_)``

const HResponses_ = styled(H_)`
    text-align: right;
`

const Contents_ = styled.div`
    display: grid;
    align-items: center;
    grid-column-gap: ${spacing(0.5)};
    width: 100%;
    padding: ${spacing(0.25)};
    position: relative;
    z-index: 5;
    @media ${mq.small} {
        grid-template-columns: min-content 1fr min-content;
    }
    @media ${mq.mediumLarge} {
        grid-template-columns: min-content 1fr min-content;
    }
`

const LabelContents_ = styled(Contents_)`
    display: flex;
    justify-content: space-between;
`

const Person_ = styled.div`
    @media ${mq.small} {
        display: flex;
        flex-direction: column;
        gap: ${spacing(0.25)};
        flex: 1;
    }
    @media ${mq.mediumLarge} {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
    }
`

const Label_ = styled.div`
    padding-left: ${spacing(0.25)};
`

const Name_ = styled.div`
    white-space: nowrap;
    font-size: ${fontSize('smallish')};
    @media ${mq.small} {
        overflow: hidden;
        text-overflow: ellipsis;
    }
`

const Links_ = styled.div`
    display: flex;
    justify-content: flex-start;
    @media ${mq.small} {
        overflow-x: visible;
        width: 100%;
    }
`

const Count_ = styled.div`
    text-align: right;
    padding: 0 ${spacing(0.5)};
    font-size: ${fontSize('medium')};
`

export default PeopleBlock
