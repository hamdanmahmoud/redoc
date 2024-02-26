import * as React from 'react';
import { OperationModel } from '../../services';

interface DownloadResponseProps {
  operation?: OperationModel;
  content: any;
  format?: string;
}

const getHrefTextFormat = (format?: string) => {
  if (format === 'text/csv') {
    return format;
  }
  return 'text/plain';
};

export const DownloadResponse = ({ operation, content, format }: DownloadResponseProps) => {
  content = typeof content === 'object' && content !== null ? JSON.stringify(content) : content;
  const downloadItAnchor = (
    <a
      style={{ color: '#326CD1', cursor: 'pointer', fontWeight: 600 }}
      href={`data:${getHrefTextFormat(format)};charset=utf-8,${encodeURIComponent(content)}`}
      download={`${operation?.id || ''}Response`}
    >
      download it
    </a>
  );

  return (
    <>Response payload length is too long to show here, but you can still {downloadItAnchor}.</>
  );
};
