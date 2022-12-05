import React from 'react';
import styled from 'styled-components';
import { mq, spacing, fontSize } from 'core/theme';
import { getQuestionLabel } from './labels';
import { useI18n } from 'core/i18n/i18nContext';
import { AXIS_BG, AXIS_BG2, AXIS_PADDING, GRID_GAP } from './constants';

const Corner = (props) => {
  const { entities, stateStuff } = props;
  const { getString } = useI18n();
  const { xSection, ySection, xField, yField } = stateStuff;
  return (
    <Corner_>
      <CornerInner_>
        <XQuestionLabel_>
          <SVGTriangle1_ viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="0,0 100,0 100,100" />
          </SVGTriangle1_>
          <span>{getQuestionLabel({ getString, sectionId: xSection, questionId: xField, entities })} →</span>
        </XQuestionLabel_>
        <YQuestionLabel_>
          <SVGTriangle2_ viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="0,0 100,100 0,100" />
          </SVGTriangle2_>
          <span>↓ {getQuestionLabel({ getString, sectionId: ySection, questionId: yField, entities })}</span>
        </YQuestionLabel_>
        {/* <Edit_>Click to edit</Edit_> */}
      </CornerInner_>
    </Corner_>
  );
};

const Corner_ = styled.div`
  grid-template-area: controls;
  position: relative;

  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(2px);
  .details-grid & {
    position: static;
  }
`;

const CornerInner_ = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${GRID_GAP}px;
`;

const QuestionLabel_ = styled.div`
  display: flex;
  align-items: center;
  padding: ${AXIS_PADDING}px;
  font-size: 12px;
  background: ${AXIS_BG};
  position: relative;
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    width: 100%;
  }
  .details-grid & {
    background: ${AXIS_BG2};
  }
`;

const SVGTriangle_ = styled.svg`
  position: absolute;

  polygon {
    fill: ${AXIS_BG};
    .details-grid & {
      fill: ${AXIS_BG2};
    }
  }
`;
const SVGTriangle1_ = styled(SVGTriangle_)`
  top: 100%;
  right: 0;
  height: calc(100% + 0px);
`;

const SVGTriangle2_ = styled(SVGTriangle_)`
  top: 0;
  left: 100%;
  height: 100%;
`;

const XQuestionLabel_ = styled(QuestionLabel_)``;
const YQuestionLabel_ = styled(QuestionLabel_)`
  width: 82%;
  width: calc(100% - 38px);
`;

export default Corner;
