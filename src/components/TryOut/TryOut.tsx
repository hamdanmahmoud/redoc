import * as _ from 'lodash';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { OperationModel } from '../../services';
import { getCleanRequest, getUpdatedPayload } from '../../utils/tryout';
import { ResponseSamples as ResponseSection } from '../ResponseSamples/ResponseSamples';
import { Body } from './Body';
import { Params } from './Params';
import { RunButton } from './styled.elements';

enum RequestObjectType {
    HEADER = 'header',
    BODY = 'body'
};

interface TryOutProps {
    operation: OperationModel;
    response: any;
    pendingRequest: boolean;
    handleApiCall: (request: any) => void;
}

export type RequestBodyPayloadType = string | number | object | null;

const getInitialBodyByOperation = (operation: OperationModel): RequestBodyPayloadType => {
    if (!operation.requestBody) return null;
    const schemaType = operation.requestBody?.content?.mediaTypes[0]?.schema?.type;
    switch (schemaType) {
        case 'string': return '';
        case 'number': return 0;
        case 'array': return [];
        case 'object': return {};
        default: throw Error(`Schema of type ${schemaType} not yet supported. Supported schema types: string, number, object.`);
    }
}

export const TryOut = observer(({ operation, response, pendingRequest, handleApiCall }: TryOutProps) => {
    const [request, setRequest] = React.useState({queryParams: {}, pathParams: {}, cookieParams: {}, header: {}, body: getInitialBodyByOperation(operation)});
    const [isFormData, setIsFormData] = React.useState(true);
    const [error, setError] = React.useState(undefined);
    const [showError, setShowError] = React.useState(false);

    React.useEffect(() => {
        if (isFormData) {
            setRequest(request => ({
                ...request,
                body: getInitialBodyByOperation(operation) // if isFormData set to true, body state is reset
            }));
        }
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
    const onRequestInputChange = (fieldName?: string, value?: any, arrayIndex?: number, ancestors?: string[], location?: string) => {
        if (location && !fieldName) throw Error(`If location parameter is defined as ${location}, it is mandatory for fieldName to be defined as well.`);
        const ancestorsCopy = ancestors && _.cloneDeep(ancestors); // directly mutating original ancestors would lead to inconsistencies across inputs
        switch (location) {
            case 'path': {
                setRequest(request => ({
                    ...request,
                    pathParams: {
                        ...request.pathParams,
                        [fieldName as string]: value
                    }
                }));
                break;
            }
            case 'query': {
                setRequest(request => ({
                    ...request,
                    queryParams: {
                        ...request.queryParams,
                        [fieldName as string]: value
                    }
                }));
                break;
            }
            case 'cookie': {
                setRequest(request => ({
                    ...request,
                    cookieParams: {
                        ...request.cookieParams,
                        [fieldName as string]: value
                    }
                }));
                break;
            }
            case 'header': {
                setRequest(request => ({
                    ...request,
                    header: {
                        ...request.header,
                        [fieldName as string]: value
                    }
                }));
                break;
            }
            default: { // location is undefined only for body
                setRequest(request => {
                    // Because react updates state in ways I sometimes don't fully understand, a deep
                    // clone of ancestors is passed to avoid ancestors array being empty on follow-up executions
                    // of the initial setRequest call, thus avoiding request body nested object keys
                    // being spread throughout the root request body as well
                    const updatedObject = getUpdatedPayload(request.body, fieldName, value, arrayIndex, _.cloneDeep(ancestorsCopy));

                    if (typeof(request.body) !== 'object') throw Error(`Request body expected to be of type object, found type ${typeof(request.body)} instead.`);

                    return {
                        ...request,
                        [RequestObjectType.BODY]: updatedObject
                    }
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
    //             body: _.omit(_.omit(_.omit(request.body, fieldToBeRemoved), fieldToBeRemoved.toLowerCase()), fieldToBeRemoved.toUpperCase()) // super hacky, just for the moment
    //         });
    //     }
    // )

    reaction(
        () => operation && operation?.requestBody!?.content!?.active!?.name,
        (activeName, prevActiveName) => {
            console.log(`Content type changed from ${prevActiveName} to ${activeName}`);
            setRequest({
                ...request,
                body: getInitialBodyByOperation(operation)
            })
        }
    )

    const headerParams = operation.parameters?.filter(param => param.in === 'header');
    const queryParams = operation.parameters?.filter(param => param.in === 'query');
    const pathParams = operation.parameters?.filter(param => param.in === 'path');
    const cookieParams = operation.parameters?.filter(param => param.in === 'cookie');

    const isJsonContent = _.toLower(operation?.requestBody?.content?.active?.name) === 'application/json' ;

    const schemaType = operation.requestBody?.content?.mediaTypes[0]?.schema?.type;

    const onHeaderChange = (fieldName, value, arrayIndex, ancestors, location) => onRequestInputChange(fieldName, value, arrayIndex, ancestors, location);
    const onBodyChange = isFormData && isJsonContent && schemaType === 'object' 
        ? (fieldName, value, arrayIndex, ancestors) => onRequestInputChange(fieldName, value, arrayIndex, ancestors, undefined) 
        : (value) => {
            setRequest(request => ({
                ...request,
                body: value
            }));
        };

    const handleRunClick = () => {
        if (error) {
            setShowError(true);
        } else {
            setShowError(false);
            handleApiCall(getCleanRequest(request));
        }
    }

    return (
        <>
            <Params params={pathParams} location={'path'} onChange={onHeaderChange}/>
            <Params params={queryParams} location={'query'} onChange={onHeaderChange}/>
            <Params params={headerParams} location={'header'} onChange={onHeaderChange}/>
            <Params params={cookieParams} location={'cookie'} onChange={onHeaderChange}/>
            {showError && (
                <>{error}</>
            )}
            <Body 
                specBody={operation.requestBody} 
                requestBody={request.body} 
                onChange={onBodyChange} 
                isFormData={isFormData} 
                setIsFormData={setIsFormData} 
                setError={setError} 
            />
            <ResponseSection customResponse={response} />
            <RunButton disabled={pendingRequest} onClick={handleRunClick}>{`Run`}</RunButton>
        </>
    );
});
