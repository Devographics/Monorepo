import React from 'react'
import styled from 'styled-components'
import { ToolsCardinalityByUserBucket } from 'core/survey_api/tools'
// @ts-ignore
import { spacing, mq } from 'core/theme'
import { SectionItem } from './SectionItem'

export const AllSectionsToolsCardinalityByUserChart = ({
    data,
    units,
    maxNumberOfTools,
}: {
    data: {
        sectionId: string
        data: ToolsCardinalityByUserBucket[]
    }[]
    units: 'percentage_survey' | 'count'
    maxNumberOfTools: number
}) => (
    <GridContainer>
        {data.map((section) => (
            <SectionItem
                key={section.sectionId}
                sectionId={section.sectionId}
                data={section.data}
                units={units}
                maxNumberOfTools={maxNumberOfTools}
            />
        ))}
    </GridContainer>
)

const GridContainer = styled.div`
    display: grid;
    column-gap: ${spacing(1.5)};

    @media ${mq.small} {
        grid-template-columns: 1fr;
        row-gap: ${spacing(1)};
    }

    @media ${mq.mediumLarge} {
        grid-template-columns: repeat(3, minmax(120px, 1fr));
        row-gap: ${spacing(1.5)};
    }

    @media ${mq.large} {
        grid-template-columns: repeat(3, minmax(120px, 1fr));
        row-gap: ${spacing(1.5)};
        column-gap: ${spacing(1.5)};
    }
`
