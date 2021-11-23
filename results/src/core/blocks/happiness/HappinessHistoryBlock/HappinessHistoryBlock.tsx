import React, { useState } from 'react'
// @ts-ignore
import Block from 'core/blocks/block/Block'
import { BlockContext } from 'core/blocks/types'
import { HappinessYearMean } from 'core/survey_api/happiness'
import { HappinessHistoryChart } from './HappinessHistoryChart'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'

interface HappinessHistoryBlockProps {
    block: BlockContext<'happinessHistoryTemplate', 'HappinessHistoryBlock'>
    data: HappinessYearMean[]
}

export const HappinessHistoryBlock = ({ block, data }: HappinessHistoryBlockProps) => {
  const [view, setView] = useState('viz');
  const { translate } = useI18n()

  const headings = [{id: 'year', label: translate('table.year')}, {id: 'mean', label: translate('table.mean')}];
  const rows = [];
  data.forEach((row) => {
    rows.push([{id: 'year', label: row.year}, {id: 'mean', label: `${row.mean}/5`}]);
  });

  const tables = [{headings: headings, rows: rows}];

  return  <Block data={data} block={block} view={view} setView={setView} tables={tables}>
        <HappinessHistoryChart data={data} />
    </Block>
}
