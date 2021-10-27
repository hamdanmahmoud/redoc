import { observer } from 'mobx-react';
import * as React from 'react';
import * as _ from 'lodash';

import { Badge, RightPanel, H2, MiddlePanel, Row, Tab, TabList, TabPanel, Tabs } from '../../common-elements';
import { OperationModel } from '../../services/models';
import styled from '../../styled-components';
import { CallbacksList } from '../Callbacks';
//import { CallbackSamples } from '../CallbackSamples/CallbackSamples';
import { Endpoint } from '../Endpoint/Endpoint';
import { ExternalDocumentation } from '../ExternalDocumentation/ExternalDocumentation';
import { Extensions } from '../Fields/Extensions';
import { Markdown } from '../Markdown/Markdown';
import { OptionsContext } from '../OptionsProvider';
import { Parameters } from '../Parameters/Parameters';
import { RequestSamples } from '../RequestSamples/RequestSamples';
import { ResponsesList } from '../Responses/ResponsesList';
import { ResponseSamples } from '../ResponseSamples/ResponseSamples';
import { SecurityRequirements } from '../SecurityRequirement/SecurityRequirement';
import { TryOut } from '../TryOut/TryOut';

const OperationRow = styled(Row)`
  backface-visibility: hidden;
  contain: content;
  overflow: hidden;
`;

const Description = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.unit * 6}px;
`;

const Details = styled.div`
  color: #58585B;
  font-weight: 100;
  background: transparent;
  font-size:24px;
  border-bottom: 1px solid #DFDFDF;
  margin: 5% 0% 10% 0%;
  padding-bottom: 8%;
`;

enum NoRequestBodyHttpVerb {
  GET = 'get',
  HEAD = 'head',
  OPTIONS = 'options',
  DELETE = 'delete',
  TRACE = 'trace',
}

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };
const CLIENT_ERROR_RESPONSE = { content: {}, code: `Error`, type: 'error'};
export interface OperationProps {
  operation: OperationModel;
}

export interface OperationState {
  response: any;
  tabIndex: number;
  pendingRequest: boolean;
  [x: string]: any;
}

interface Request {
  headers?: HeadersInit;
  body?: BodyInit | null;
  queryParams?: any;
  pathParams?: any;
  cookieParams?: any;
}

const appendPathParamsToPath = (path, pathParams) => {
  const entries = Object.entries(pathParams);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    path = path.replace(`{${key}}`, value);
  }
  return path;
}

const appendQueryParamsToPath = (path, queryParams) => {
  const entries = Object.entries(queryParams);
  let paramsSuffix = '';

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    paramsSuffix += paramsSuffix === '' ? `${key}=${value}`: `&${key}=${value}`;
  }
  return paramsSuffix === '' ? path : `${path}?${paramsSuffix}`;
}

const setCookieParams = (cookieParams) => {
  const entries = Object.entries(cookieParams);
  const cookies: string[] = [];
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    cookies.push(`${key}=${value}`)
  }
  document.cookie = cookies.join(';');
}

@observer
export class Operation extends React.Component<OperationProps, OperationState> {
  constructor(props) {
    super(props);
    
    this.state = {
      response: '',
      tabIndex: 0,
      pendingRequest: false,
    };
  }

  handleApiCall = ({ queryParams, pathParams, cookieParams, headers, body }: Request) => {
    let { operation: { httpVerb, path } } = this.props;
    
    headers = { ...DEFAULT_HEADERS, ...headers };
    body = JSON.stringify(this.getCleanedObject(body));
    
    const request = (Object.values(NoRequestBodyHttpVerb).map(value => String(value)).indexOf(httpVerb) !== -1)
      ? {
        method: httpVerb,
        headers,
      }
      : {
        method: httpVerb,
        headers,
        body
      };

    path = appendPathParamsToPath(path, pathParams);
    path = appendQueryParamsToPath(path, queryParams);

    setCookieParams(cookieParams);

    this.setState({ pendingRequest: true });
    fetch(`${path}`, request)
      .then((response: any) => {
        const statusCode = response.status;
        const contentType = response.headers.get("content-type");
        response = contentType && contentType.indexOf("application/json") !== -1
        ? response.json()
        : response.text();

        response.then(
          data => {
            console.log("Parsed response is:", data);
            this.setState({
              response: {
                type: this.mapStatusCodeToType(statusCode),
                code: statusCode || 0,
                content: data,
              }
            });
          }
        );

        return response;
      })
      .catch((e) => setTimeout(() => {console.log(e); if (!this.state.response.code) this.setState({ response: CLIENT_ERROR_RESPONSE })}, 1000))
      .finally(() => setTimeout(() => this.setState({ pendingRequest: false }), 1000));
  };

  getCleanedObject = (obj) => {
    if (!obj || typeof(obj) !== 'object') return obj;

    // Cleans input array from any falsy values
    const getCleanedArray = (arr) => {
      let i = 0;
      while (i < arr.length) {
        if (!arr[i]) { // might be a source of unexpected bugs if array items are boolean
          arr.splice(i, 1);
        } else {
          ++i;
        }
      }
      return arr;
    }

    const decorate = (obj) => {
      return {
        ...obj,
        removeUndefinedFields: function removeUndefinedFields () {
          const entries = Object.entries(this);
          if (entries.length === 0) return this;

          entries.forEach(
            ([key, value]) => {
              this[key] === undefined 
              ? delete this[key]
              : typeof(this[key]) === 'object' ? removeUndefinedFields.bind(this[key])() : value
            }
          );
          return this;
        },
        cleanArrayFields: function cleanArrayFields () {
          const entries = Object.entries(this);
          if (entries.length === 0) return this;

          entries.forEach(
            ([key, value]) => {
              this[key] = Array.isArray(value) 
              ? getCleanedArray(value)
              : typeof(this[key]) === 'object' ? cleanArrayFields.bind(this[key])() : value
            }
          )
          return this;
        },
        omitFunctionFields: function () {
          return _.omitBy(this, _.isFunction);
        }
      }
    }

    const decoratedObject = decorate(obj);

    return decoratedObject
      .removeUndefinedFields()
      .cleanArrayFields()
      .omitFunctionFields();
  }

  mapStatusCodeToType = (code) => {
    switch (true) {
      case (_.inRange(code, 100, 200)):
        return 'info';
      case (_.inRange(code, 200, 300)):
        return 'success';
      case (_.inRange(code, 300, 400)):
        return 'redirect';
      case (_.inRange(code, 400, 600)):
        return 'error';
      default:
        return '';
    }
  }

  render() {
    const { operation } = this.props;
    const { name: summary, description, deprecated, externalDocs, isWebhook } = operation;
    const hasDescription = !!(description || externalDocs);

    return (
      <OptionsContext.Consumer>
        {(options) => (
          <OperationRow>
            <MiddlePanel>
              <H2>
                {summary} {deprecated && <Badge type="warning"> Deprecated </Badge>}
                {isWebhook && <Badge type="primary"> Webhook </Badge>}
              </H2>
              {options.pathInMiddlePanel && !isWebhook && (
                <Endpoint operation={operation} inverted={true} />
              )}
              {hasDescription && (
                <Description>
                  {description !== undefined && <Markdown source={description} />}
                  {externalDocs && <ExternalDocumentation externalDocs={externalDocs} />}
                </Description>
              )}
              <H2>
                {!options.pathInMiddlePanel && !isWebhook && <Endpoint operation={operation} />}
                {operation.parameters && (operation.parameters.length > 0)}
              </H2>
              <Extensions extensions={operation.extensions} />
              <SecurityRequirements securities={operation.security} />
              <Parameters parameters={operation.parameters} body={operation.requestBody} />
              <ResponsesList responses={operation.responses} />
              <CallbacksList callbacks={operation.callbacks} />
            </MiddlePanel>
            <RightPanel>
              <Details>Details</Details>
              <Tabs defaultIndex={0} onSelect={tabIndex => this.setState({ tabIndex })}>
                <TabList>
                  <Tab className={'tab-try-out'} key={'Try out'}>{'Run'}</Tab>
                  <Tab className={'tab-examples'} key={'Examples'}>{'Example'}</Tab>
                </TabList>
                <TabPanel key={'Try out panel'}>
                  <TryOut
                    operation={operation}
                    response={this.state.response}
                    pendingRequest={this.state.pendingRequest}
                    handleApiCall={this.handleApiCall}
                  />
                </TabPanel>
                <TabPanel key={'Examples panel'}>
                  <Tabs defaultIndex={0}>
                    <TabList>
                      <Tab className={'tab-examples-request'} key={'Request'}>{'Request'}</Tab>
                      <Tab className={'tab-examples-response'} key={'Response'}>{'Response'}</Tab>
                    </TabList>
                    <TabPanel key={'Request'}>
                      <RequestSamples
                        operation={operation}
                        editable={false}
                      />
                    </TabPanel>
                    <TabPanel key={'Response'}>
                      <ResponseSamples operation={operation} />
                    </TabPanel>
                  </Tabs>
                </TabPanel>
              </Tabs>
            </RightPanel>
          </OperationRow>
        )}
      </OptionsContext.Consumer>
    );
  }
}
