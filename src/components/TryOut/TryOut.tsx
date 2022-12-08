import { cloneDeep, toLower } from 'lodash';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { OperationModel } from '../../services';
import {
  anyInvalidRequiredField,
  getCleanRequest,
  getRequiredFields,
  getUpdatedObject,
  RequiredField,
} from '../../utils/tryout';
import { ResponseSamples as ResponseSection } from '../ResponseSamples/ResponseSamples';
import { Body } from './Body';
import { Params } from './Params';
import { RunButton } from './styled.elements';

enum RequestObjectType {
  HEADER = 'header',
  BODY = 'body',
}

interface TryOutProps {
  operation: OperationModel;
  response: any;
  pendingRequest: boolean;
  handleApiCall: (request: any) => void;
}

export type RequestBodyPayloadType = string | number | boolean | object | null;

const getInitialBodyByOperation = (operation: OperationModel): RequestBodyPayloadType => {
  if (!operation.requestBody) return null;
  const schemaType = operation.requestBody?.content?.mediaTypes[0]?.schema?.type;
  switch (schemaType) {
    case 'string':
      return '';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      throw Error(
        `Schema of type ${schemaType} not yet supported. Supported schema types: string, number, integer, boolean, array, object.`,
      );
  }
};

export const TryOut = observer(
  ({ operation, response, pendingRequest, handleApiCall }: TryOutProps) => {
    const [request, setRequest] = React.useState({
      queryParams: {},
      pathParams: {},
      cookieParams: {},
      header: {},
      body: getInitialBodyByOperation(operation),
    });
    const [isFormData, setIsFormData] = React.useState(true);
    const [error, setError] = React.useState(undefined);
    const [showError, setShowError] = React.useState(false);
    const [requiredFields, setRequiredFields] = React.useState<RequiredField[]>(
      getRequiredFields(operation),
    );

    React.useEffect(() => {
      setRequest(request => ({
        ...request,
        body: getInitialBodyByOperation(operation),
      }));
    }, [isFormData]);

    /**
     *
     * @param fieldName Field that will be changed
     * @param value Corresponding (new) value for which field is changed to
     * @param arrayIndex If fieldName is an array field, value will be set to this index inside the array
     * @param ancestors Considering fieldName a node inside a JSON object which is in fact a tree,
     * this list contains all ancestors of this node (i.e. of all ancesators of the field).
     * If field is at the top of JSON object, this list is empty.
     * @param location From OAS 3 specification: OpenAPI 3.0 distinguishes between the following parameter types based on the parameter location.
     * The location is determined by the parameter’s in key, for example, in: query or in: path.
     */
    const onRequestInputChange = (
      fieldName?: string,
      value?: any,
      arrayIndex?: number,
      ancestors?: string[],
      location?: string,
    ) => {
      if (location && !fieldName)
        throw Error(
          `If location parameter is defined as ${location}, it is mandatory for fieldName to be defined as well.`,
        );
      const ancestorsCopy = ancestors && cloneDeep(ancestors); // directly mutating original ancestors would lead to inconsistencies across inputs

      // for this particular field if required
      const requiredField = requiredFields.find(item => item.fieldName === fieldName);
      if (requiredField && !arrayIndex) {
        setRequiredFields(requiredFields => {
          const restOfFields = requiredFields.filter(field => field !== requiredField);
          const newRequiredField = { ...requiredField };
          newRequiredField.valid = !!value;
          return [...restOfFields, newRequiredField];
        });
      }

      // for required ancestors
      if (!arrayIndex && value !== undefined) {
        ancestors?.forEach(ancestor => {
          setRequiredFields(requiredFields => {
            const requiredField = requiredFields.find(item => {
              const hasAncestorName = item.fieldName === ancestor;
              const descendsFromThisAncestor =
                ancestors.join('.').indexOf(item.ancestors.join('.')) !== -1;
              return hasAncestorName && descendsFromThisAncestor;
            });
            if (!requiredField) return requiredFields;

            const restOfFields = requiredFields.filter(field => field !== requiredField);
            const newRequiredField = {
              ...requiredField,
              valid: true,
            };
            return [...restOfFields, newRequiredField];
          });
        });
      }

      switch (location) {
        case 'path': {
          setRequest(request => {
            if (arrayIndex !== undefined) {
              const updatedObject = getUpdatedObject(
                request.pathParams,
                fieldName,
                value,
                arrayIndex,
                cloneDeep(ancestorsCopy),
              ) as object;
              return {
                ...request,
                pathParams: updatedObject,
              };
            }
            return {
              ...request,
              pathParams: {
                ...request.pathParams,
                [fieldName as string]: value,
              },
            };
          });
          break;
        }
        case 'query': {
          setRequest(request => {
            if (arrayIndex !== undefined) {
              const updatedObject = getUpdatedObject(
                request.queryParams,
                fieldName,
                value,
                arrayIndex,
                cloneDeep(ancestorsCopy),
              ) as object;
              return {
                ...request,
                queryParams: updatedObject,
              };
            }
            return {
              ...request,
              queryParams: {
                ...request.queryParams,
                [fieldName as string]: value,
              },
            };
          });
          break;
        }
        case 'cookie': {
          setRequest(request => {
            if (arrayIndex !== undefined) {
              const updatedObject = getUpdatedObject(
                request.cookieParams,
                fieldName,
                value,
                arrayIndex,
                cloneDeep(ancestorsCopy),
              ) as object;
              return {
                ...request,
                cookieParams: updatedObject,
              };
            }
            return {
              ...request,
              cookieParams: {
                ...request.cookieParams,
                [fieldName as string]: value,
              },
            };
          });
          break;
        }
        case 'header': {
          setRequest(request => {
            if (arrayIndex !== undefined) {
              const updatedObject = getUpdatedObject(
                request.header,
                fieldName,
                value,
                arrayIndex,
                cloneDeep(ancestorsCopy),
              ) as object;
              return {
                ...request,
                header: updatedObject,
              };
            }
            return {
              ...request,
              header: {
                ...request.header,
                [fieldName as string]: value,
              },
            };
          });
          break;
        }
        default: {
          // location is undefined only for body
          setRequest(request => {
            // Because react updates state in ways I sometimes don't fully understand, a deep
            // clone of ancestors is passed to avoid ancestors array being empty on follow-up executions
            // of the initial setRequest call, thus avoiding request body nested object keys
            // being spread throughout the root request body as well
            const updatedObject = getUpdatedObject(
              request.body,
              fieldName,
              value,
              arrayIndex,
              cloneDeep(ancestorsCopy),
            );

            if (typeof request.body !== 'object')
              throw Error(
                `Request body expected to be of type object, found type ${typeof request.body} instead.`,
              );

            return {
              ...request,
              [RequestObjectType.BODY]: updatedObject,
            };
          });
          break;
        }
      }
    };

    // this currently works only for first level of nesting, TODO: think more general for a depth of n
    // furthermore, it assumes JSON content, so TODO: tweak it to support multiple content types
    // reaction(
    //     () => operation && operation?.requestBody!?.content!?.active!?.schema!?.activeOneOf,
    //     (activeOneOf, prevActiveOneOf) => {

    //         console.log(`Content active schema changed from ${prevActiveOneOf} to ${activeOneOf}`);
    //         const schema = operation && operation?.requestBody!?.content!?.active!?.schema;
    //         const discriminatorProp = schema!?.discriminatorProp;
    //         const discriminatorTitle = schema!?.oneOf![activeOneOf].title;
    //         setTimeout(() => onRequestInputChange(discriminatorProp, discriminatorTitle, undefined), 0); // timeout to avoid MiddlePanel not triggering proper state change due to Mobx observables taking a bit + only works for one level of nesting
    //         const fieldToBeRemoved = schema!?.oneOf![prevActiveOneOf].title; // nested object field that got changed through dropdown
    //         setRequest({
    //             ...request,
    //             body: omit(omit(omit(request.body, fieldToBeRemoved), fieldToBeRemoved.toLowerCase()), fieldToBeRemoved.toUpperCase()) // super hacky, just for the moment
    //         });
    //     }
    // )

    reaction(
      () => operation && operation?.requestBody?.content?.active?.name,
      (activeName, prevActiveName) => {
        console.log(`Content type changed from ${prevActiveName} to ${activeName}`);
        setRequest({
          ...request,
          body: getInitialBodyByOperation(operation),
        });
      },
    );

    const headerParams = operation.parameters?.filter(param => param.in === 'header');
    const queryParams = operation.parameters?.filter(param => param.in === 'query');
    const pathParams = operation.parameters?.filter(param => param.in === 'path');
    const cookieParams = operation.parameters?.filter(param => param.in === 'cookie');

    const contentType = toLower(operation?.requestBody?.content?.active?.name);
    const isJsonContent = contentType === 'application/json';
    const isFormDataContent = contentType === 'multipart/form-data';

    const schemaType = operation.requestBody?.content?.mediaTypes[0]?.schema?.type;

    const onHeaderChange = (fieldName, value, arrayIndex, ancestors, location) =>
      onRequestInputChange(fieldName, value, arrayIndex, ancestors, location);

    const onBodyChange =
      isFormData && (isJsonContent || isFormDataContent) && schemaType === 'object'
        ? (fieldName, value, arrayIndex, ancestors) =>
            onRequestInputChange(fieldName, value, arrayIndex, ancestors, undefined)
        : value => {
            setRequest(request => ({
              ...request,
              body: value,
            }));
          };

    const handleRunClick = () => {
      if (error) {
        setShowError(true);
      } else {
        setShowError(false);
        handleApiCall(getCleanRequest(request));
      }
    };

    return (
      <>
        <Params params={pathParams} location={'path'} onChange={onHeaderChange} />
        <Params params={queryParams} location={'query'} onChange={onHeaderChange} />
        <Params params={headerParams} location={'header'} onChange={onHeaderChange} />
        <Params params={cookieParams} location={'cookie'} onChange={onHeaderChange} />
        {showError && <>{error}</>}
        <Body
          specBody={operation.requestBody}
          onChange={onBodyChange}
          isFormData={isFormData}
          error={error}
          setIsFormData={setIsFormData}
          setError={setError}
          requestPayload={request?.body}
        />
        <ResponseSection
          operation={operation}
          customResponse={response}
          showResponseSamples={false}
        />
        <RunButton
          disabled={pendingRequest || (isFormData && anyInvalidRequiredField(requiredFields))}
          onClick={handleRunClick}
        >{`Run`}</RunButton>
      </>
    );
  },
);
