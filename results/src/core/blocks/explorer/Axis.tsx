import React from 'react';
import styled, { css } from 'styled-components';
import { mq, spacing, fontSize } from 'core/theme';
import T from 'core/i18n/T';
import { AXIS_PADDING, AXIS_BG, AXIS_BG2, GRID_GAP, DOT_GAP, DOT_RADIUS, CELL_VPADDING } from './constants';
import { CommonProps, Key, AxisType, Total } from './types';
import { getQuestionLabel, getOptionLabel } from './labels';
import { useI18n } from 'core/i18n/i18nContext';
import maxBy from 'lodash/maxBy.js';
import { getCellData } from './helpers';
import { UserIcon, PercentIcon } from 'core/icons';
import Tooltip from 'core/components/Tooltip';

interface AxisProps extends CommonProps {
  axis: AxisType;
  keys: Key[];
}

const getAxisStyle = (props) => {
  const { axis, facets, id, xTotals, stateStuff } = props;
  const { respondentsPerDot, percentsPerDot, dotsPerLine, unit } = stateStuff;
  if (axis === 'y') {
    const facet = facets.find((f) => f.id === id);
    const rowCells = facet.buckets.map((bucket, xIndex) =>
      getCellData({ facet, xTotals, xIndex, respondentsPerDot, percentsPerDot, dotsPerLine, unit })
    );
    const biggestCell = maxBy(rowCells, (c) => c.dotsCount);
    const { dotsCount, rowCount } = biggestCell;
    const dynamicHeight = DOT_RADIUS * rowCount + DOT_GAP * (rowCount - 1) + CELL_VPADDING * 2;
    return { flexBasis: `${Math.max(100, dynamicHeight)}px` };
  } else {
    return {};
  }
};

const Axis = (props: AxisProps) => {
  const { axis, keys } = props;
  return (
    <Axis_ axis={axis} count={keys.length}>
      {keys.map((key: string, index) => (
        <AxisItem key={key} index={index} id={key} {...props} />
      ))}
    </Axis_>
  );
};

interface AxisItemProps extends AxisProps {
  id: string;
  index: number;
  xTotals: Total[];
  yTotals: Total[];
}

const AxisItem = (props: AxisItemProps) => {
  const { id, axis, index, entities, stateStuff, totalCount } = props;
  const { useMobileLayout } = stateStuff;
  const totals = props[`${axis}Totals`];
  const { getString } = useI18n();
  const sectionId = stateStuff[`${axis}Section`];
  const questionId = stateStuff[`${axis}Field`];

  const rowColumnTotal = totals.find((t) => t.id === id)?.total;
  const totalPercentage = Math.floor((rowColumnTotal * 100) / totalCount);

  const answerLabel = getOptionLabel({ getString, sectionId, questionId, optionId: id, isShort: useMobileLayout });

  return (
    <AxisItem_ axis={axis} style={getAxisStyle(props)}>
      <Tooltip
        trigger={
          <AxisItemInner_>
            <AxisLabel_ dangerouslySetInnerHTML={{ __html: answerLabel }} />
            <AxisTotals_>
              <AxisTotal_>
                <UserIcon
                  enableHover={false}
                  enableTooltip={false}
                  labelId="explorer.axis_total"
                  values={{ totalCount: rowColumnTotal }}
                />
                <span>{rowColumnTotal}</span>
              </AxisTotal_>
              <AxisTotal_>
                <PercentIcon
                  enableHover={false}
                  enableTooltip={false}
                  labelId="explorer.axis_percentage"
                  values={{ totalPercentage }}
                />
                <span>{totalPercentage}</span>
              </AxisTotal_>
            </AxisTotals_>
          </AxisItemInner_>
        }
        contents={<span>TODO</span>}
        // contents={
        //   axis === 'y' ? (
        //     <span>
        //       Out of all **{}** respondents who completed question “{xAxisLabel}”, **{totalCount}** survey respondents picked “
        //       {answerLabel}” for “{yAxisLabel}”{/* <T k="explorer.axis_total" values={{ totalCount }} /> */}
        //     </span>
        //   ) : (
        //     <span>
        //       Out of all **{}** respondents who completed question “{yAxisLabel}”, **{totalCount}** survey respondents picked “
        //       {answerLabel}” for “{xAxisLabel}”{/* <T k="explorer.axis_total" values={{ totalCount }} /> */}
        //     </span>
        //   )
        // }
      />
    </AxisItem_>
  );
};

const Axis_ = styled.div<{ axis: AxisType; count: number }>`
  /* position: absolute; */
  font-size: 12px;

  ${({ axis, count }) =>
    axis === 'y'
      ? css`
          display: flex;
          flex-direction: column;
          gap: ${GRID_GAP}px;
        `
      : css`
          display: grid;
          grid-auto-columns: minmax(0, 1fr);
          grid-auto-flow: column;
          grid-column-gap: ${GRID_GAP}px;
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(2px);
          .details-grid & {
            position: static;
          }
        `}
`;

const AxisItem_ = styled.div<{ axis: AxisType }>`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  background: ${AXIS_BG};
  display: flex;
  padding: ${AXIS_PADDING}px;
  justify-content: center;
  text-align: center;
  align-items: center;
  cursor: default;
  .details-grid & {
    background: ${AXIS_BG2};
  }
`;

const AxisItemInner_ = styled.div``;

const AxisLabel_ = styled.div``;

const AxisTotals_ = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  @media ${mq.small} {
    gap: 5px;
    flex-direction: column;
  }
`;

const AxisTotal_ = styled.div`
  color: ${({ theme }) => theme.colors.textAlt};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  .icon-wrapper {
    height: 16px;
    width: 16px;
    svg {
      color: ${({ theme }) => theme.colors.textAlt};
      height: 100%;
      width: 100%;
    }
  }
`;

export default Axis;
