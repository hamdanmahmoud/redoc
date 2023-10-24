import * as React from 'react';

import { Code } from './styled.elements';
import { Markdown } from '../Markdown/Markdown';
import { ShelfIcon } from '../../common-elements';
import { Link } from '../Redoc/styled.elements';

export interface ResponseTitleProps {
  code: string;
  title: string;
  type: string;
  empty?: boolean;
  opened?: boolean;
  className?: string;
  onClick?: () => void;
}

function ResponseTitleComponent({
  title,
  empty,
  code,
  opened,
  className,
  onClick,
}: ResponseTitleProps): React.ReactElement {
  return (
    <button className={className} aria-expanded={opened} disabled={empty}>
      <Code>{code} </Code>
      <Markdown compact={true} inline={true} source={title} />
      {!empty && (
        <Link onClick={onClick || undefined}>
          <span>{`${opened ? 'Hide' : 'View'} Details`}</span>
          <ShelfIcon size={'1.5em'} color={'#326CD1'} direction={opened ? 'down' : 'right'} />
        </Link>
      )}
    </button>
  );
}

export const ResponseTitle = React.memo<ResponseTitleProps>(ResponseTitleComponent);
