import React, { useState } from 'react';
import styled from 'styled-components';
import { mq, spacing, fontSize, fontWeight } from 'core/theme';
import Selector from './Selector';
import { useI18n } from 'core/i18n/i18nContext';
import Button from 'core/components/Button';
import T from 'core/i18n/T';
import { HEADING_BG, AXIS_PADDING, GRID_GAP } from './constants';
import theme from 'Theme/index.ts';
import { CommonProps } from './types';
import { usePageContext } from 'core/helpers/pageContext';
import ShareTwitter from 'core/share/ShareTwitter';
import ShareEmail from 'core/share/ShareEmail';
import ShareFacebook from 'core/share/ShareFacebook';
import ShareLinkedIn from 'core/share/ShareLinkedIn';

interface ShareModalProps extends CommonProps {
  closeModal?: any;
}
// the modal handles its own internal state before updating the overall explorer state on submit
const ShareModal = (props: ShareModalProps) => {
  const { getString } = useI18n();

  const context = usePageContext();
  console.log(context);
  const surveyName = context.currentSurvey.name;
  const year = context.currentEdition.year;
  const { stateStuff, closeModal } = props;
  const { xAxisLabel, yAxisLabel } = stateStuff;

  const link = window?.location?.href;
  // const encodedLink = encodeURIComponent(window?.location?.href);
  const values = { xAxisLabel, yAxisLabel, surveyName, year, link };
  const text = getString && getString('explorer.share.tweet', { values })?.t;
  return (
    <ShareModal_>
      <h3>
        <T k="explorer.share.title" values={values} />
      </h3>

      <Container_ className="ShareSite">
        <ShareTwitter twitterText={text} twitterLink={link} />
        <ShareFacebook link={link} />
        <ShareLinkedIn link={link} title={text} />
        <ShareEmail subject={text} body={`${text}: ${link}`} />
      </Container_>
    </ShareModal_>
  );
};

const ShareModal_ = styled.div``;

const Container_ = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

export default ShareModal;
