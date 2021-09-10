import * as React from 'react';

import { StoreConsumer } from '../components/StoreBuilder';
import { HistoryService } from '../services';

const isModifiedEvent = event =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export class Link extends React.Component<{ to: string; className?: string; children?: any }> {
  navigate = (history: HistoryService, event) => {
    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();
      history.replace(this.props.to);
    }
  };

  render() {
    return (
      <StoreConsumer>
        {store => (
          <a
            className={this.props.className}
            href={store!.menu.history.linkForId(this.props.to)}
            onClick={this.navigate.bind(this, store!.menu.history)}
            aria-label={this.props.to}
          >
            {this.props.children}
          </a>
        )}
      </StoreConsumer>
    );
  }
}