import { observer } from 'mobx-react';
import * as React from 'react';
import { MediaTypeSamples } from './MediaTypeSamples';

import { MediaContentModel } from '../../services/models';
import { DropdownOrLabel } from '../DropdownOrLabel/DropdownOrLabel';
import { MediaTypesSwitch } from '../MediaTypeSwitch/MediaTypesSwitch';
import { InvertedSimpleDropdown, MimeLabel } from './styled.elements';
import { JsonViewer } from '../JsonViewer/JsonViewer';

const defaultJSON = JSON.parse(`{\"your\" : \"customJSON\"}`);
export interface PayloadSamplesProps {
  content?: MediaContentModel;
  editable?: boolean;
  customData?: any;
}

@observer
export class PayloadSamples extends React.Component<PayloadSamplesProps> {
  render() {
    const mimeContent = this.props.content;
    const editable = this.props.editable;
    const customData = this.props.customData;

    if (customData) {
      return <JsonViewer data={customData} editable={editable} />;
    }

    if (mimeContent === undefined) {
      return <JsonViewer data={defaultJSON} editable={editable} />;
    }

    return (
      <MediaTypesSwitch content={mimeContent} renderDropdown={this.renderDropdown} withLabel={true}>
        {mediaType => (
          <MediaTypeSamples
            key="samples"
            mediaType={mediaType}
            renderDropdown={this.renderDropdown}
            editable={editable}
          />
        )}
      </MediaTypesSwitch>
    );
  }

  private renderDropdown = props => {
    return (
      <DropdownOrLabel
        Label={MimeLabel}
        Dropdown={InvertedSimpleDropdown}
        {...props}
        variant="dark"
      />
    );
  };
}
