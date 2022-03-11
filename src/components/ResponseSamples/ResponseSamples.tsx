import { observer } from 'mobx-react';
import * as React from 'react';

import { OperationModel } from '../../services/models';

import { RightPanelHeader, Tab, TabList, TabPanel, Tabs } from '../../common-elements';
import { PayloadSamples } from '../PayloadSamples/PayloadSamples';
import { l } from '../../services/Labels';

export interface ResponseSamplesProps {
  operation?: OperationModel;
  customResponse?: any;
}

@observer
export class ResponseSamples extends React.Component<ResponseSamplesProps> {
  operation: OperationModel;

  render() {
    const { operation, customResponse } = this.props;
    const responses = operation?.responses.filter(response => {
      return response.content && response.content.hasSample;
    });
    const hasResponseSamples = responses && responses.length > 0;

    return customResponse || hasResponseSamples ? (
      <div>
        {customResponse ? (
          <>
            <RightPanelHeader> {l('response')} </RightPanelHeader>
            <div>
              <PayloadSamples customData={customResponse} />
            </div>
          </>
        ) : (
          <Tabs defaultIndex={0}>
            <TabList>
              {hasResponseSamples
                ? responses?.map(response => (
                    <Tab className={'tab-' + response.type} key={response.code}>
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
