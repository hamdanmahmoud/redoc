import { observer } from 'mobx-react';
import * as React from 'react';

import { OperationModel } from '../../services/models';

import { RightPanelHeader, Tab, TabList, TabPanel, Tabs } from '../../common-elements';
import { PayloadSamples } from '../PayloadSamples/PayloadSamples';
import { l } from '../../services/Labels';
import { DownloadResponse } from './DownloadResponse';
const MAX_CONTENT_LENGTH = 10000;

export interface ResponseSamplesProps {
  operation?: OperationModel;
  customResponse?: any;
  showResponseSamples?: boolean;
}

@observer
export class ResponseSamples extends React.Component<ResponseSamplesProps> {
  operation: OperationModel;

  render() {
    const { operation, customResponse, showResponseSamples = true } = this.props;
    const responses = operation?.responses.filter(response => {
      return response.content && response.content.hasSample;
    });
    const hasResponseSamples = responses && responses.length > 0;
    const { content, format } = customResponse || {};
    const contentLength = content?.length || JSON.stringify(content)?.length || 0;
    const reachedMaxPayloadLength = contentLength > MAX_CONTENT_LENGTH;

    return customResponse || (hasResponseSamples && showResponseSamples) ? (
      <div>
        {customResponse ? (
          <>
            <RightPanelHeader> {l('response')} </RightPanelHeader>
            <div>
              {reachedMaxPayloadLength ? (
                <DownloadResponse operation={operation} content={content} format={format} />
              ) : (
                <PayloadSamples customData={customResponse} />
              )}
            </div>
          </>
        ) : (
          <Tabs defaultIndex={0}>
            <TabList>
              {hasResponseSamples
                ? responses?.map(response => (
                    <Tab className={'status-code tab-' + response.type} key={response.code}>
                      {response.code}
                    </Tab>
                  ))
                : null}
            </TabList>
            {hasResponseSamples
              ? responses?.map(response => (
                  <TabPanel key={response.code}>
                    <div>
                      <PayloadSamples content={response.content!} />
                    </div>
                  </TabPanel>
                ))
              : null}
          </Tabs>
        )}
      </div>
    ) : null;
  }
}
