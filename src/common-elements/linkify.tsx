import * as React from 'react';

import { StoreContext } from '../components/StoreBuilder';

import { HistoryService } from '../services';

const isModifiedEvent = event =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export function Link(props: { to: string; className?: string; children?: any }) {
  const store = React.useContext(StoreContext);
  const clickHandler = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!store) return;
      navigate(store.menu.history, event, props.to);
    },
    [store, props.to],
  );

  if (!store) return null;

  return (
    <a
      className={props.className}
      href={store!.menu.history.linkForId(props.to)}
      onClick={clickHandler}
      aria-label={props.to}
    >
      {props.children}
    </a>
  );
}

function navigate(history: HistoryService, event: React.MouseEvent<HTMLAnchorElement>, to: string) {
  if (
    !event.defaultPrevented && // onClick prevented default
    event.button === 0 && // ignore everything but left clicks
    !isModifiedEvent(event) // ignore clicks with modifier keys
  ) {
    event.preventDefault();
    history.replace(to);
  }
}
