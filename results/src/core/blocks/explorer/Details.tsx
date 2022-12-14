import React, { useState, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { mq, spacing, fontSize, fontWeight } from 'core/theme';
import T from 'core/i18n/T';
// import Dot from './Dot'
import { CellProps } from './Cell';
import { getQuestionLabel, getOptionLabel } from './labels';
import { useI18n } from 'core/i18n/i18nContext';
import Grid from './Grid';
import sumBy from 'lodash/sumBy.js';
import UnitsSelector from './UnitsSelector';
import { UnitType } from './types';
import { COUNT_UNIT } from './constants';
import round from 'lodash/round.js';
import Legend from './Legend';

export interface DetailsProps extends CellProps {
  cellData: any;
}

const getSingleCellGrid = (options: {
  props: DetailsProps;
  xKey: string;
  yKey: string;
  unit: UnitType;
  setUnit: Dispatch<SetStateAction<UnitType>>;
}) => {
  const { props, xKey, yKey, unit, setUnit } = options;
  const { facets, keys1, keys2, xTotals, yTotals, entities, totalCount, stateStuff } = props;
  const singleCellGrid = {
    showCellCountsOverride: true,
    addModals: false,
    entities,
    stateStuff: { ...stateStuff, unit, setUnit },
    totalCount,
    keys1: keys1.filter((k) => k === xKey),
    keys2: keys2.filter((k) => k === yKey),
    xTotals: xTotals.filter((t) => t.id === xKey),
    yTotals: yTotals.filter((t) => t.id === yKey),
    facets: facets
      .filter((f) => f.id === yKey)
      .map((f) => {
        return { ...f, buckets: f.buckets.filter((b) => b.id === xKey) };
      }),
  };
  return singleCellGrid;
};

const Details = (props: DetailsProps) => {
  const { getString } = useI18n();
  const { facet, keys1, keys2, entities, xIndex, yIndex, xTotals, yTotals, stateStuff, cellData, totalCount } = props;
  const [unit, setUnit] = useState(stateStuff.unit);
  const xKey = keys1[xIndex];
  const yKey = keys2[yIndex];
  const propsOverride = getSingleCellGrid({ props, xKey, yKey, unit, setUnit });
  const { xSection, ySection, xField, yField } = stateStuff;

  const xTotal = sumBy(xTotals, 'total');
  const yTotal = sumBy(yTotals, 'total');

  const {
    dots,
    bucketTotal,
    facetTotal,
    bucketPercentage,
    facetPercentageQuestion,
    facetPercentageSurvey,
    bucketCount,
    normalizedCount,
    normalizedCountDelta,
    normalizedPercentage,
    normalizedPercentageDelta,
  } = cellData;
  const xAxisLabel = getQuestionLabel({ getString, sectionId: xSection, questionId: xField, entities });
  const yAxisLabel = getQuestionLabel({ getString, sectionId: ySection, questionId: yField, entities });

  const xAnswerLabel = getOptionLabel({ getString, sectionId: xSection, questionId: xField, optionId: xKey });
  const yAnswerLabel = getOptionLabel({ getString, sectionId: ySection, questionId: yField, optionId: yKey });

  const deltaValue = unit === COUNT_UNIT ? normalizedCountDelta : normalizedPercentageDelta;
  const missingOrExtra = deltaValue > 0 ? 'extra' : 'missing';

  const tProps = {
    md: true,
    html: true,
    element: 'p',
    values: {
      xAxisTotal: bucketTotal,
      xAxisPercentage: Math.floor((bucketTotal * 100) / totalCount),
      xAxisLabel,
      xAnswerLabel,

      yAxisTotal: yTotal,
      yAxisPercentage: facetPercentageQuestion,
      yAxisLabel,
      yAnswerLabel,

      bucketPercentage,
      normalizedCount,
      bucketCount,
      normalizedCountDelta: Math.abs(normalizedCountDelta),
      normalizedPercentage,
      normalizedPercentageDelta: round(normalizedPercentageDelta, 2),
    },
  };

  return (
    <Details_>
      <DetailsUnit_>
        <UnitsSelector {...propsOverride} />
      </DetailsUnit_>
      <DetailsLegend_>
        <Legend {...propsOverride} />
      </DetailsLegend_>
      <DetailsGrid_ className="details-grid">
        <Grid {...propsOverride} />
      </DetailsGrid_>

      <DetailsExplanation_>
        <DetailsExplanationHeading_>
          <T k={`explorer.${missingOrExtra}_respondents`} />
        </DetailsExplanationHeading_>
        {unit === COUNT_UNIT ? (
          <>
            <T k={`explorer.${unit}_details.1`} {...tProps} />
            <T k={`explorer.${unit}_details.2`} {...tProps} />
            <T k={`explorer.${unit}_details.3`} {...tProps} />
            <T k={`explorer.${unit}_details.4_${missingOrExtra}`} {...tProps} />
          </>
        ) : (
          <>
            <T k={`explorer.${unit}_details.1_${missingOrExtra}`} {...tProps} />
            <T k={`explorer.${unit}_details.2_${missingOrExtra}`} {...tProps} />
          </>
        )}
      </DetailsExplanation_>
    </Details_>
  );
};

const Details_ = styled.div``;

const DetailsUnit_ = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${spacing()};
`;

const DetailsLegend_ = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${spacing()};
`;
const DetailsGrid_ = styled.div``;

const DetailsExplanation_ = styled.div`
  margin-top: ${spacing()};
  em {
    font-style: normal;
    /* font-weight: ${fontWeight('bold')}; */
    color: ${({ theme }) => theme.colors.link};
  }
`;
const DetailsExplanationHeading_ = styled.h3``;

// const DetailsCell_ = styled(Cell_)`
//   width: 160px;
//   height: 160px;
//   cursor: default;
// `;

export default Details;
