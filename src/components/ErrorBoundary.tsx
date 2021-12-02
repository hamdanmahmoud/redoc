import * as React from 'react';

import { DEFAULT_OPTIONS } from '../services/AppStore';
import { RedocNormalizedOptions } from '../services/RedocNormalizedOptions';
import { Loading } from './Loading/Loading';
import { Redoc } from './Redoc/Redoc';
import { StoreBuilder } from './StoreBuilder';

const DEFAULT_SPEC = {
  "openapi": "3.0.0",
  "info": {
    "title": "Not available",
    "description": "",
  },
  "paths": {}
};

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<unknown>,
  { error?: Error }
> {
  constructor(props) {
    super(props);
    this.state = { error: undefined };
  }

  componentDidCatch(error) {
    this.setState({ error });
    return false;
  }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.error && prevState.error === this.state.error) {
      this.setState({ error: undefined });
    }
  }

  render() {
    const normalizedOpts = new RedocNormalizedOptions(DEFAULT_OPTIONS);
    normalizedOpts.theme.sidebar.backgroundColor = '#930c00';
    normalizedOpts.theme.colors.primary.main = '#930c00';
    if (this.state.error) {
      const errorMessage = this.state.error.message;

      DEFAULT_SPEC.info.description = `${errorMessage}`;

      return (
        <StoreBuilder spec={DEFAULT_SPEC}>
        {({ loading, store }) => {
          if (store) store!.options = normalizedOpts;
          return (
            !loading && store ? (
                <Redoc store={store!} />
            ) : (
              <Loading color={normalizedOpts.theme.colors.primary.main} />
            )
          )
        }
        }
        </StoreBuilder>
      );
    }
    return React.Children.only(this.props.children);
  }
}
