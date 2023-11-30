import { observer } from 'mobx-react';
import * as React from 'react';

import {
  Badge,
  H2,
  MiddlePanel,
  RightPanel,
  Row,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from '../../common-elements';
import { OperationModel } from '../../services/models';
import styled from '../../styled-components';
import {
  appendParamsToPath,
  entriesToQueryString,
  mapStatusCodeToType,
  setCookieParams,
} from '../../utils/tryout';
import { CallbacksList } from '../Callbacks';
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

const Description = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.unit * 6}px;
`;

enum NoRequestBodyHttpVerb {
  GET = 'get',
  HEAD = 'head',
  OPTIONS = 'options',
  TRACE = 'trace',
}

const DEFAULT_CLIENT_ERROR_RESPONSE = { content: {}, code: `Error`, type: 'error' };

interface OperationProps {
  operation: OperationModel;
}

interface OperationState {
  response: any;
  tabIndex: number;
  pendingRequest: boolean;
}

interface Request {
  header?: HeadersInit;
  queryParams?: any;
  pathParams?: any;
  cookieParams?: any;
  body?: BodyInit | null;
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

  /**
   * Mapping between 'header' and 'headers' needed due to the fact that openapi standard
   * defines param location as being one of 'path', 'query', 'cookie' or 'header', while
   * fetch API defines request as having RequestInit type, which has 'headers' as a member field
   */
  handleApiCall = ({
    queryParams,
    pathParams,
    cookieParams,
    header: headers,
    body = null,
  }: Request) => {
    const {
      operation: { httpVerb, path, requestBody },
    } = this.props;

    const requestBodyContent = requestBody?.content;
    const activeMimeIdx = requestBodyContent?.activeMimeIdx;
    const contentType =
      activeMimeIdx === undefined ? undefined : requestBodyContent?.mediaTypes[activeMimeIdx]?.name;

    const isFormData = contentType === 'multipart/form-data';

    if (!isFormData) {
      headers = { 'Content-Type': contentType || 'application/json', ...headers };
    }

    const getFormDataWithObjectEntriesAppended = (
      object: Record<string, any>,
      formData: FormData,
    ) => {
      if (!object || typeof object !== 'object' || !formData) {
        return formData;
      }
      Object.entries(object as any).forEach(([key, value]) => {
        const isFileValue = (value as any) instanceof File;
        const isJsonValue = !isFileValue && typeof value === 'object' && value !== null;
        formData.append(
          key,
          isFileValue ? (value as any) : isJsonValue ? JSON.stringify(value)! : value,
        );
      });
      return formData;
    };

    const getFormDataFromObject = (object: Record<string, any>) => {
      const formData = new FormData();
      return getFormDataWithObjectEntriesAppended(object, formData);
    };

    const getQueryStringFromObject = (object: Record<string, any>) => {
      const entries = Object.entries(object as any);
      return entriesToQueryString(entries);
    };

    const getBodyByContentType = (body: BodyInit | null, contentType: string | undefined): any => {
      if (typeof body === 'string' || body === null) {
        return body;
      }
      const isFormData = contentType === 'multipart/form-data';
      const isEncodedFormContent = contentType === 'application/x-www-form-urlencoded';
      if (isFormData) {
        return getFormDataFromObject(body);
      }
      if (isEncodedFormContent) {
        return getQueryStringFromObject(body);
      }
      return JSON.stringify(body);
    };

    const request: RequestInit =
      Object.values(NoRequestBodyHttpVerb)
        .map(value => String(value))
        .indexOf(httpVerb) !== -1
        ? {
            method: httpVerb,
            headers,
          }
        : {
            method: httpVerb,
            headers,
            body: getBodyByContentType(body, contentType),
          };

    setCookieParams(cookieParams);

    this.setState({ pendingRequest: true });
    fetch(`${appendParamsToPath(path, pathParams, queryParams)}`, request)
      .then((response: any) => {
        const statusCode = response.status;
        const contentType = response.headers.get('content-type');

        response.text().then(data => {
          let content = data;
          if (contentType && contentType.indexOf('application/json') !== -1) {
            try {
              content = JSON.parse(data);
            } catch (_e) {
              // we can safely swallow error, as content is already set few lines above
            }
          }
          this.setState({
            response: {
              type: mapStatusCodeToType(statusCode),
              code: statusCode || 0,
              content,
            },
          });
        });
        return response;
      })
      .catch(e =>
        setTimeout(() => {
          console.log(e);
          if (!this.state.response.code) {
            this.setState({ response: DEFAULT_CLIENT_ERROR_RESPONSE });
          } else {
            this.setState({
              response: {
                content:
                  'Ooops! Encountered an error. Most likely returned payload does not match Content-type response header.',
                code: this.state.response.code,
                type: 'error',
              },
            });
          }
        }, 1000),
      )
      .finally(() => setTimeout(() => this.setState({ pendingRequest: false }), 1000));
  };

  render() {
    const { operation } = this.props;
    const { name: summary, description, deprecated, externalDocs, isWebhook } = operation;
    const hasDescription = !!(description || externalDocs);

    return (
      <OptionsContext.Consumer>
        {options => (
          <Row background="white" borderRadius="8px" padding="24px" bordered>
            <MiddlePanel>
              <H2 noMargin>
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
                {operation.parameters && operation.parameters.length > 0}
              </H2>
              <Extensions extensions={operation.extensions} />
              <SecurityRequirements securities={operation.security} />
              <Parameters parameters={operation.parameters} body={operation.requestBody} />
              <ResponsesList responses={operation.responses} />
              <CallbacksList callbacks={operation.callbacks} />
            </MiddlePanel>
            <RightPanel>
              <Tabs defaultIndex={0} onSelect={tabIndex => this.setState({ tabIndex })}>
                <TabList>
                  <Tab className={'tab-try-out'} key={'Try out'}>
                    <span>{'Run'}</span>
                  </Tab>
                  <Tab className={'tab-examples'} key={'Examples'}>
                    <span>{'Example'}</span>
                  </Tab>
                </TabList>
                <TabPanel key={'Try out panel'}>
                  <TryOut
                    operation={operation}
                    response={this.state.response}
                    pendingRequest={this.state.pendingRequest}
                    handleApiCall={this.handleApiCall}
                    disableUnsafeCalls={options.disableUnsafeCalls}
                  />
                </TabPanel>
                <TabPanel key={'Examples panel'}>
                  <Tabs defaultIndex={0}>
                    <TabList>
                      <Tab className={'tab-examples-request toggle left-toggle'} key={'Request'}>
                        {'Request'}
                      </Tab>
                      <Tab className={'tab-examples-response toggle right-toggle'} key={'Response'}>
                        {'Response'}
                      </Tab>
                    </TabList>
                    <TabPanel key={'Request'}>
                      <RequestSamples operation={operation} editable={false} />
                    </TabPanel>
                    <TabPanel key={'Response'}>
                      <ResponseSamples operation={operation} />
                    </TabPanel>
                  </Tabs>
                </TabPanel>
              </Tabs>
            </RightPanel>
          </Row>
        )}
      </OptionsContext.Consumer>
    );
  }
}
