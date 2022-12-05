import { useState, useEffect } from 'react';
import sumBy from 'lodash/sumBy';
import { ExplorerDataBucket, ExplorerDataFacet, Key, AxisType, Total, UnitType, DotType } from './types';
import { TOTAL_DOTS, INCREMENT, GAP, GRID_WIDTH } from './constants';
import variables from 'Config/variables.yml';

// https://stackoverflow.com/a/36862446/649299
const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

/* 

Find bucket containing the most items

*/
export const getMaxBucketCount = (facets: ExplorerDataFacet[]) => {
  let maxBucketCount = 0;
  facets.forEach((f) => {
    f.buckets.forEach((b) => {
      if (b.count > maxBucketCount) {
        maxBucketCount = b.count;
      }
    });
  });
  return maxBucketCount;
};

/*

Get grid parameters

*/
export const getParameters = ({
  facets,
  keys1,
  keys2,
}: {
  facets: ExplorerDataFacet[];
  keys1: Key[];
  keys2: Key[];
}) => {
  const maxBucketCount = getMaxBucketCount(facets);
  const columnCount = keys1.length;
  const rowCount = keys2.length;
  const cellWidth = Math.floor((GRID_WIDTH - (columnCount - 1) * GAP) / columnCount);
  const maxDotsPerLine = Math.floor(cellWidth / INCREMENT);
  const columnWidth = maxDotsPerLine * INCREMENT;
  return {
    gap: GAP,
    columnCount,
    rowCount,
    cellWidth,
    maxDotsPerLine,
    columnWidth,
    maxBucketCount,
  };
};

export const addExtraCounts = (facets: ExplorerDataFacet[]) => {
  let facetRunningCount = 0,
    bucketRunningCount = 0;
  const facetsWithCounts = facets.map((f: ExplorerDataFacet, i: number) => {
    f.fromCount = facetRunningCount;
    facetRunningCount += f.completion.count;
    f.toCount = facetRunningCount;
    f.rowIndex = i;
    f.buckets.forEach((b: ExplorerDataBucket, j: number) => {
      b.fromCount = bucketRunningCount;
      bucketRunningCount += b.count;
      b.toCount = bucketRunningCount;
      b.columnIndex = j;
    });
    return f;
  });
  return facetsWithCounts;
};

export const isBetween = (i: number, lowerBound = 0, upperBound = 0) => {
  return lowerBound <= i && i <= upperBound;
};

const getOptGroups = (categories: any) => {
  return Object.keys(categories).map((id) => {
    return { id, fields: categories[id] };
  });
};

export const getSelectorItems = () => {
  const selectorItems = [
    {
      id: 'demographics',
      optGroups: [
        {
          id: 'all_fields',
          fields: [
            'age',
            'years_of_experience',
            'company_size',
            'higher_education_degree',
            'yearly_salary',
            'gender',
            'race_ethnicity',
            'disability_status',
          ],
        },
      ],
    },
    { id: 'features', optGroups: getOptGroups(variables.featuresCategories) },
    { id: 'tools', optGroups: getOptGroups(variables.toolsCategories) },
  ];
  return selectorItems;
};

export const getTotals = ({
  facets,
  axis,
  keys,
}: {
  facets: ExplorerDataFacet[];
  axis: AxisType;
  keys: Key[];
}): Total[] => {
  if (axis === 'x') {
    // facet 1
    return keys.map((key: Key) => {
      const total = sumBy(facets, (facet: ExplorerDataFacet) => {
        const bucket = facet.buckets.find((b) => b.id === key);
        return bucket?.count || 0;
      });
      return {
        id: key,
        total,
      };
    });
  } else {
    // facet 2
    return keys.map((key: Key) => {
      const facet = facets.find((f: ExplorerDataFacet) => f.id === key);
      return { id: key, total: facet?.completion?.count || 0 };
    });
  }
};

/*

Get all data for a single cell when we already know its facet (row)

*/
export const getCellData = (options: {
  facet: ExplorerDataFacet;
  xTotals: Total[];
  xIndex: number;
  respondentsPerDot: number;
  percentsPerDot: number;
  dotsPerLine: number;
  unit: UnitType;
}) => {
  const { facet, xTotals, xIndex, respondentsPerDot, percentsPerDot, dotsPerLine, unit } = options;
  // find the right bucket for the current cell based on its xIndex (column index)
  const bucket = facet?.buckets[xIndex];
  // aggregated sum for every instance of this bucket (column total)
  const bucketTotal = xTotals.find((t) => t.id === bucket.id)?.total || 0;
  // total count for current facet (row total)
  const facetTotal = facet.completion.count;
  // what percentage of question respondents are represented by this facet
  const facetPercentageQuestion = facet.completion.percentage_question;
  // what percentage of survey respondents are represented by this facet
  // note: we probably don't want to use this here because all totals used already
  // discount people who didn't answer the question
  const facetPercentageSurvey = facet.completion.percentage_survey;
  // count for current bucket (cell)
  const bucketCount = bucket.count;
  // percentage of bucket relative to current facet (row)
  const bucketPercentageFacet = bucket.percentage_facet;
  // count that you would expect based solely on total respondents for this bucket overall,
  // divided by percentage of question respondents in this facet
  const normalizedCount = Math.floor((bucketTotal * facetPercentageQuestion) / 100);
  // delta between expected count and real count
  const normalizedCountDelta = bucketCount - normalizedCount;
  // same delta expressed as a percentage
  const normalizedPercentage = Math.floor((bucketTotal * facetPercentageQuestion) / facetTotal);
  const normalizedPercentageDelta = bucketPercentageFacet - normalizedPercentage;

  const dots = getCellDots({ bucket, normalizedCount, normalizedPercentage, respondentsPerDot, percentsPerDot, unit });

  const dotsCount = dots.length;
  const columnCount = dotsPerLine;
  const rowCount = Math.ceil(dotsCount / columnCount);

  return {
    dots,
    dotsCount,
    columnCount,
    rowCount,
    bucketTotal,
    facetTotal,
    facetPercentageQuestion,
    facetPercentageSurvey,
    bucketCount,
    bucketPercentage: bucketPercentageFacet,
    normalizedCount,
    normalizedCountDelta,
    normalizedPercentage,
    normalizedPercentageDelta,
  };
};

/*

Get the dots for a single cell of the grid

*/

export const getCellDots = ({
  bucket,
  normalizedCount,
  normalizedPercentage,
  respondentsPerDot,
  percentsPerDot,
  unit,
}: {
  bucket: ExplorerDataBucket;
  normalizedCount: number;
  normalizedPercentage: number;
  respondentsPerDot: number;
  percentsPerDot: number;
  unit: UnitType;
}) => {
  // console.log(bucket);
  // console.log(normalizedPercentage);
  if (unit === 'count') {
    // find the right bucket for the current cell based on its xIndex (column index)
    const peopleCount = Math.max(normalizedCount, bucket.count);
    const dotCount = Math.floor(peopleCount / respondentsPerDot);
    return [...Array(dotCount)].map((x, index) => {
      const peopleInDot = index * respondentsPerDot;
      let type;
      if (peopleInDot <= bucket.count && peopleInDot <= normalizedCount) {
        type = 'normal';
      } else if (peopleInDot <= bucket.count) {
        type = 'extra';
      } else if (peopleInDot <= normalizedCount) {
        type = 'missing';
      }
      return { index, type };
    });
  } else {
    // find the right bucket for the current cell based on its xIndex (column index)
    const percentCount = Math.max(normalizedPercentage, bucket.percentage_facet);
    const dotCount = Math.floor(percentCount / percentsPerDot);
    return [...Array(dotCount)].map((x, index) => {
      const percentsInDot = index * percentsPerDot;
      let type;
      if (percentsInDot <= bucket.percentage_facet && percentsInDot <= normalizedPercentage) {
        type = 'normal';
      } else if (percentsInDot <= bucket.percentage_facet) {
        type = 'extra';
      } else if (percentsInDot <= normalizedPercentage) {
        type = 'missing';
      }
      return { index, type };
    });
  }
};
