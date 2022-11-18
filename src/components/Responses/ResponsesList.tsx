import * as React from 'react';
import { l } from '../../services/Labels';
import { ResponseModel } from '../../services/models';
import styled from '../../styled-components';
import { ResponseView } from './Response';

const ResponsesHeader = styled.h3`
  color: #373838;
  font-weight: bold;
  background: transparent;
  font-size: 14px;
  margin: 5% 0% 16px 0%;
`;

export interface ResponseListProps {
  responses: ResponseModel[];
  isCallback?: boolean;
}

export class ResponsesList extends React.PureComponent<ResponseListProps> {
  render() {
    const { responses, isCallback } = this.props;

    if (!responses || responses.length === 0) {
      return null;
    }

    return (
      <div>
        <ResponsesHeader>{isCallback ? l('callbackResponses') : l('responses')}</ResponsesHeader>
        {responses.map(response => {
          return <ResponseView key={response.code} response={response} />;
        })}
      </div>
    );
  }
}
