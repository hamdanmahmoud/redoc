import { observer } from 'mobx-react';
import * as React from 'react';
import { isPayloadSample, OperationModel, RedocNormalizedOptions } from '../../services';
import { PayloadSamples } from '../PayloadSamples/PayloadSamples';

import { RightPanelHeader } from '../../common-elements';
import { OptionsContext } from '../OptionsProvider';

export interface RequestSamplesProps {
  operation: OperationModel;
  editable?: boolean;
}

export interface RequestSamplesState {
  tabIndex: number;
}


@observer
export class RequestSamples extends React.Component<RequestSamplesProps, RequestSamplesState> {
  static contextType = OptionsContext;
  context: RedocNormalizedOptions;
  operation: OperationModel;

  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0,
    };
  }

  render() {
    const { operation, editable } = this.props;
    const samples = operation.codeSamples;

    const hasSamples = samples.length > 0;
    return (
      (
        <div>
          {editable && <RightPanelHeader> {`Request Body`} </RightPanelHeader>}
          {editable
            ? <div>
              <PayloadSamples editable={editable} />
            </div>
            : <>
              {
                hasSamples ? samples.map(sample => (
                  isPayloadSample(sample) ? (
                    <div>
                      <PayloadSamples content={sample.requestBodyContent} editable={editable} />
                    </div>
                  ) : null
                )) : `No request samples to display`}
            </>
          }
        </div>
      ) ||
      null
    );
  }
}
