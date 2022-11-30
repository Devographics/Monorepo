import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import Block from 'core/blocks/block/BlockVariant';
import ChartContainer from 'core/charts/ChartContainer';
// import ParticipationByCountryChart from 'core/charts/demographics/ParticipationByCountryChart'
import { getTableData } from 'core/helpers/datatables';
import { getCountryName } from 'core/helpers/countries';
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart';

const ParticipationByCountryBlock = ({ block, data, triggerId, units: defaultUnits = 'percentage_survey' }) => {
  const { id, mode = 'relative', translateData, chartNamespace = block.blockNamespace ?? block.id } = block;

  const { completion } = data;
  const { total } = completion;

  const [units, setUnits] = useState(defaultUnits);

  const buckets = data.facets[0].buckets;

  const chartClassName = triggerId ? `ParticipationByCountryChart--${triggerId}` : '';

  return (
    <Block
      tables={[
        getTableData({
          data: buckets.map((b) => ({ ...b, label: getCountryName(b.id) })),
        }),
      ]}
      units={units}
      setUnits={setUnits}
      data={data}
      block={block}
      completion={data.completion}
    >
      <ChartContainer height={600} minWidth={800}>
        <div style={{ height: '100%', overflow: 'hidden' }} className={`ParticipationByCountryChart ${chartClassName}`}>
          <HorizontalBarChart
            total={total}
            i18nNamespace={chartNamespace}
            translateData={translateData}
            mode={mode}
            units={units}
            buckets={buckets.map((b) => ({ ...b, label: getCountryName(b.id) }))}
          />
          {/* <ParticipationByCountryChart units={units} data={buckets} /> */}
        </div>
      </ChartContainer>
    </Block>
  );
};

ParticipationByCountryBlock.propTypes = {
  block: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    completion: PropTypes.shape({
      count: PropTypes.number.isRequired,
      percentage_survey: PropTypes.number.isRequired,
    }).isRequired,
    facets: PropTypes.arrayOf(
      PropTypes.shape({
        buckets: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          })
        ).isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default memo(ParticipationByCountryBlock);
