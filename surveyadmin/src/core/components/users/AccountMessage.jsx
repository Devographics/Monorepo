import React from 'react';
import { Components } from 'meteor/vulcan:core';
import { intlShape } from 'meteor/vulcan:i18n';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const AccountMessage = (props, { intl }) => (
  <div className="message account-message">
    <h3>
      <FormattedMessage id="general.why_create_account" />
    </h3>

    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
      {intl.formatMessage({ id: 'general.create_account_reasons' })}
    </ReactMarkdown>
    {/* <p>
      We take your data seriously, and guarantee we will not pass it on to third parties.
    </p> */}
  </div>
);

AccountMessage.contextTypes = {
  intl: intlShape,
};

export default AccountMessage;
