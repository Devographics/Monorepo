import React from 'react';
import styled from 'styled-components';
import T from 'core/i18n/T';
import ButtonGroup from 'core/components/ButtonGroup';
import Button from 'core/components/Button';
import { COUNT_UNIT, PERCENTAGE_UNIT } from './constants';
import { CommonProps, UnitType } from './types';

const UnitsSelector = ({ stateStuff }: CommonProps) => {
  const { unit, setUnit } = stateStuff;
  return (
    <ButtonGroup>
      <UnitButton currentUnit={unit} buttonUnit={COUNT_UNIT} setUnit={setUnit} />
      <UnitButton currentUnit={unit} buttonUnit={PERCENTAGE_UNIT} setUnit={setUnit} />
    </ButtonGroup>
  );
};

const UnitButton = ({ currentUnit, buttonUnit, setUnit }: { currentUnit: UnitType; buttonUnit: UnitType; setUnit: any }) => (
  <Button
    size="small"
    className={`Button--${currentUnit === buttonUnit ? 'selected' : 'unselected'}`}
    isSelected={currentUnit === buttonUnit}
    onClick={() => {
      setUnit(buttonUnit);
    }}
  >
    <T k={`explorer.units_${buttonUnit}`} />
  </Button>
);

export default UnitsSelector;
