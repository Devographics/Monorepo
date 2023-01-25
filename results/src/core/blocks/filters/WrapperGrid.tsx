import React from 'react'
import styled, { css } from 'styled-components'
import Loading from 'core/blocks/explorer/Loading'
import { spacing, mq, fontSize } from 'core/theme'
import Tooltip from 'core/components/Tooltip'
import isEmpty from 'lodash/isEmpty'
import { CHART_MODE_GRID } from './constants'
import T from 'core/i18n/T'

const WrapperGrid = ({ layout, series, legends, children, isLoading, showDefaultSeries }) => (
    <GridWrapper_ layout={layout}>
        {series.map(({ name, buckets }, i) => (
            <GridItem_ key={name}>
                {legends && legends.length > 0 && (
                    <Tooltip
                        trigger={
                            <Legend_>
                                <span>{legends[i]?.label}</span>
                            </Legend_>
                        }
                        contents={<span>{legends[i]?.label}</span>}
                    />
                )}
                <Contents_>
                    {isEmpty(buckets) ? (
                        <EmptySeries />
                    ) : (
                        React.cloneElement(children, {
                            buckets,
                            gridIndex: i,
                            chartDisplayMode: CHART_MODE_GRID,
                            showDefaultSeries
                        })
                    )}
                </Contents_>
                {isLoading && <Loading />}
            </GridItem_>
        ))}
    </GridWrapper_>
)

const columnMinWidth = 400

const GridWrapper_ = styled.div`
    ${({ layout }) =>
        layout === 'grid'
            ? css`
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(${columnMinWidth}px, 1fr));
                  gap: ${spacing(2)};
              `
            : css`
                  display: flex;
                  flex-direction: column;
                  gap: ${spacing()};
              `}
`

const GridItem_ = styled.div`
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: ${spacing()};
`

const Legend_ = styled.h4`
    background: ${({ theme }) => theme.colors.backgroundAlt};
    padding: ${spacing(0.25)} ${spacing(0.5)};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    font-size: ${fontSize('small')};
    margin: 0;
`

const EmptySeries = () => (
    <EmptySeries_>
        <T k="filters.series.no_data" />
    </EmptySeries_>
)

const EmptySeries_ = styled.div`
    background: ${({ theme }) => theme.colors.backgroundAlt};
    display: grid;
    place-items: center;
    height: 100%;
`

const Contents_ = styled.div`
    flex: 1;
`

export default WrapperGrid
