import * as _ from 'lodash';
import { observer } from 'mobx-react';
import * as React from 'react';

import { Badge, H2, MiddlePanel, RightPanel, Row, Tab, TabList, TabPanel, Tabs } from '../../common-elements';
import { OperationModel } from '../../services/models';
import styled from '../../styled-components';
import { appendParamsToPath, mapStatusCodeToType, setCookieParams } from '../../utils/tryout';
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
const DEFAULT_CLIENT_ERROR_RESPONSE = { content: {}, code: `Error`, type: 'error'};

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
  handleApiCall = ({ queryParams, pathParams, cookieParams, header: headers, body }: Request) => {
    let { operation: { httpVerb, path } } = this.props;
    
    headers = { ...DEFAULT_HEADERS, ...headers };
    
    const request: RequestInit = (Object.values(NoRequestBodyHttpVerb).map(value => String(value)).indexOf(httpVerb) !== -1)
      ? {
        method: httpVerb,
        headers,
      }
      : {
        method: httpVerb,
        headers,
        body: JSON.stringify(body)
      };

    path = appendParamsToPath(path, pathParams, queryParams);
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
                type: mapStatusCodeToType(statusCode),
                code: statusCode || 0,
                content: data,
              }
            });
          }
        );

        return response;
      })
      .catch((e) => setTimeout(() => {console.log(e); if (!this.state.response.code) this.setState({ response: DEFAULT_CLIENT_ERROR_RESPONSE })}, 1000))
      .finally(() => setTimeout(() => this.setState({ pendingRequest: false }), 1000));
  };

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
