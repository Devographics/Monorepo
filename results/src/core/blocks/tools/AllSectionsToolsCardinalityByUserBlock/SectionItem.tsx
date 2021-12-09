import React, { useMemo, memo } from 'react'
import { maxBy } from 'lodash'
import styled, { css } from 'styled-components'
// @ts-ignore
import { format } from 'd3-format'
import { ToolsCardinalityByUserBucket } from 'core/survey_api/tools'
// @ts-ignore
import { fontSize, fontWeight, spacing, mq } from 'core/theme'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import range from 'lodash/range'
import sumBy from 'lodash/sumBy'

export const SectionItem = ({
    sectionId,
    data,
    units,
    maxNumberOfTools
}: {
    sectionId: string
    data: ToolsCardinalityByUserBucket[]
    units: 'percentage_survey' | 'count'
    maxNumberOfTools: number
}) => {
    const { translate } = useI18n()
    const getValue = useMemo(() => {
        const formatter = units === 'count' ? format('>-.2s') : format('>-.1f')

        return (bucket: ToolsCardinalityByUserBucket) => {
            return units === 'count'
                ? formatter(bucket.count)
                : `${formatter(bucket.percentage_survey)}%`
        }
    }, [units])

    let maxCount = 0
    const maxBucket = maxBy(data, 'count')
    if (maxBucket) {
        maxCount = maxBucket.count
    }

    const totalPercentage = sumBy(data, 'percentage_survey')

    return (
        <SectionContainer>
            <SectionTitle>{translate(`sections.${sectionId}.title`)}</SectionTitle>
            <Grid>
                <Row>
                    <Metric>∑</Metric>
                    <Bar>
                        <CellsWrapper />
                        <InnerBar
                            variant="total"
                            style={{
                                width: `${totalPercentage}%`
                            }}
                        />
                    </Bar>
                    <Metric>{totalPercentage}%</Metric>
                </Row>
                {range(1, maxNumberOfTools + 1).map(i => {
                    const bucket = data.find(b => b.cardinality === i)
                    const isMax = bucket !== undefined && maxCount > 0 && maxCount === bucket.count

                    return bucket ? (
                        <Row key={i}>
                            <Metric isMax={isMax}>{bucket.cardinality}</Metric>
                            <Bar isMax={isMax}>
                                <CellsWrapper />
                                <InnerBar
                                    style={{
                                        width: `${bucket.percentage_survey}%`
                                    }}
                                />
                                {isMax && (
                                    <span className="sr-only">
                                        {translate('blocks.cardinality.max')}
                                    </span>
                                )}
                            </Bar>
                            <Metric isMax={isMax}>{getValue(bucket)}</Metric>
                        </Row>
                    ) : (
                        <Row key={i}>
                            <div />
                            <Bar isMax={false}>
                                <CellsWrapper />
                            </Bar>
                            <div />
                        </Row>
                    )
                })}
            </Grid>
        </SectionContainer>
    )
}

const CellsWrapper = () => (
    <Cells>
        {range(0, 10).map(i => (
            <Cell key={i} />
        ))}
    </Cells>
)

const SectionTitle = styled.h4`
    width: 100%;
    text-align: center;
    font-size: ${fontSize('small')};
    font-weight: ${fontWeight('bold')};
    margin-bottom: ${spacing(0.5)};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: ${spacing(0.25)};
`

const Grid = styled.div`
    display: flex;
    flex-direction: column-reverse;
`

const Row = styled.div`
    display: grid;
    grid-template-columns: 36px auto 36px;
    column-gap: 6px;
    align-items: center;
    margin-bottom: 2px;
    position: relative;
`

const Cells = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    column-gap: 2px;
    height: 100%;
`
const Cell = styled.div`
    background: ${props => props.theme.colors.backgroundAlt};
`

const Bar = styled.div<{
    isMax: boolean
}>`
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    opacity: ${props => (props.isMax ? 1 : 0.7)};

    ${props =>
        props.isMax
            ? css`
                  &:before,
                  &:after {
                      top: 50%;
                      content: '';
                      position: absolute;
                      display: block;
                      width: 8px;
                      height: 8px;
                      z-index: 10;
                      background-color: ${props => props.theme.colors.barChart.primary};
                      transform-origin: center center;
                  }

                  &:before {
                      left: 0;
                      transform: translate(-50%, -50%) rotate(45deg);
                  }

                  &:after {
                      right: 0;
                      transform: translate(50%, -50%) rotate(45deg);
                  }
              `
            : ''}
`

const InnerBar = styled.div`
    background-color: ${({ variant, theme }) =>
        variant === 'total' ? theme.colors.barChart.secondary : theme.colors.barChart.primary};
    height: 100%;
    z-index: 1;
`

const Metric = styled.span<{
    isMax?: boolean
}>`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: ${fontSize('smaller')};
    font-weight: ${props =>
        props.isMax ? props.theme.typography.weight.bold : props.theme.typography.weight.light};
`

const SectionContainer = styled.div`
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-between;

    ${Bar}, ${Metric} {
        height: 16px;

        @media ${mq.small} {
            height: 14px;
            font-size: ${fontSize('smaller')};
        }
    }
`
