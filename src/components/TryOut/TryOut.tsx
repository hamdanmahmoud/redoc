import * as React from 'react';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';

import { ResponseSamples as ResponseSection } from '../ResponseSamples/ResponseSamples';
import { FieldModel, OperationModel } from '../../services';
import { OpenAPIParameterLocation } from '../../types';
import { FormSection } from './FormSection';
import { SchemaSection } from './SchemaSection';

import { SectionHeader, RunButton } from './styled.elements';
import { getObjectChange, getCleanRequest } from '../../utils/tryout';

enum RequestObjectType {
    HEADERS = 'headers',
    BODY = 'body'
};

const ParamsSection = ({ params, onHeaderChange }) => {
    if (!params && params.length) {
        return null;
    }

    return (<FormSection items={params} onChange={onHeaderChange} />);
}

interface TryOutProps {
    operation: OperationModel;
    response: any;
    pendingRequest: boolean;
    handleApiCall: (request: any) => void;
}

export const TryOut = observer(({ operation, response, pendingRequest, handleApiCall }: TryOutProps) => {
    const [request, setRequest] = React.useState({queryParams: {}, pathParams: {}, cookieParams: {}, headers: {}, body: {}});

    const mapParameterLocationToRequestField = (paramLocation: OpenAPIParameterLocation | "body"): string => {
        switch (paramLocation) {
            case 'header': return 'headers';
            case 'query': return 'queryParams';
            case 'path': return 'pathParams';
            case 'cookie': return 'cookieParams';
            case 'body': return 'body';
            default: throw Error(`Parameter does not support ${paramLocation} as location. Location can be one of: header, query, path, cookie, body.`);
        }
    }

    /**
     * Following effect hook handles state management for default request parameters
     */
    React.useEffect(() => {
        const defaultRequest = request;
        operation.parameters?.forEach(
            (param) => {
                const { schema, name } = param;
                if (schema.default !== undefined && param.in) {
                    defaultRequest[mapParameterLocationToRequestField(param.in)][name] = schema.default;
                }
            }
        );

        const schema = operation.requestBody?.content?.active?.schema;

        if (schema) {
            const hasDiscriminator: boolean = schema?.oneOf ? true : false;
            const hasOwnFields: boolean = schema?.fields && schema?.fields.length !== 0 ? true : false;
            const hasOwnItems: boolean = schema?.items ? true : false;
        
            const fields: FieldModel[] | undefined = hasDiscriminator
                ? schema?.oneOf![schema?.activeOneOf!].fields
                : (hasOwnFields ? schema?.fields : (hasOwnItems ? schema?.items?.fields : []));
        
            if (fields?.length !== 0) {
                fields?.forEach(
                    (param) => {
                        const { schema, name } = param;
                        if (schema.default !== undefined && param.in) {
                            defaultRequest[mapParameterLocationToRequestField(param.in)][name] = schema.default;
                        }
                    }
                )
            }
        }

        setRequest(defaultRequest);
    }, []);

    const handleRequestChange = (type: RequestObjectType, change) => {
        setRequest(request => ({
            ...request,
            [type]: {
                ...(type === RequestObjectType.HEADERS ? request.headers : request.body),
                ...change
            }
        }));
    }

    const onRequestInputChange = (type: RequestObjectType, name: string, value: any, indexInArray?: number, parents?: string[], location?: string, toBeRemoved?: boolean) => {
        const parentsCopy = parents && _.cloneDeep(parents); // directly mutating original parents would lead to inconsistencies across inputs
        switch (location) {
            case 'path': {
                setRequest(request => ({
                    ...request,
                    pathParams: {
                        ...request.pathParams,
                        [name]: value
                    }
                }));
                break;
            }
            case 'query': {
                setRequest(request => ({
                    ...request,
                    queryParams: {
                        ...request.queryParams,
                        [name]: value
                    }
                }));
                break;
            }
            case 'cookie': {
                setRequest(request => ({
                    ...request,
                    cookieParams: {
                        ...request.cookieParams,
                        [name]: value
                    }
                }));
                break;
            }
            case 'header': {
                const change = getObjectChange(request[type], name, value, indexInArray, parentsCopy);
                handleRequestChange(type, change);
                break;
            }
            default: {
                setRequest(request => {
                    // Because react updates state in ways I sometimes don't fully understand, a deep
                    // clone of parents is passed to avoid parents array being empty on follow-up executions
                    // of the initial setRequest call, thus avoiding request body nested object keys
                    // being spread throughout the root request body as well
                    const change = getObjectChange(request[type], name, value, indexInArray, _.cloneDeep(parentsCopy), toBeRemoved);
                    handleRequestChange(type, change);
                    return {
                        ...request,
                    }
                });
                break;
            }
        }
    };

    // this currently works only for first level of nesting, TODO: think more general for a depth of n
    reaction(
        () => operation && operation?.requestBody!?.content!?.active!?.schema!?.activeOneOf,
        (activeOneOf, prevActiveOneOf) => {
            
            console.log(`Content active schema changed from ${prevActiveOneOf} to ${activeOneOf}`);
            const schema = operation && operation?.requestBody!?.content!?.active!?.schema;
            const discriminatorProp = schema!?.discriminatorProp;
            const discriminatorTitle = schema!?.oneOf![activeOneOf].title;
            setTimeout(() => onRequestInputChange(RequestObjectType.BODY, discriminatorProp, discriminatorTitle, undefined), 0); // timeout to avoid MiddlePanel not triggering proper state change due to Mobx observables taking a bit + only works for one level of nesting
            const fieldToBeRemoved = schema!?.oneOf![prevActiveOneOf].title; // nested object field that got changed through dropdown
            setRequest({
                ...request,
                body: _.omit(_.omit(_.omit(request.body, fieldToBeRemoved), fieldToBeRemoved.toLowerCase()), fieldToBeRemoved.toUpperCase()) // super hacky, just for the moment
            });
        }
    )

    reaction(
        () => operation && operation?.requestBody!?.content!?.active!?.name,
        (activeName, prevActiveName) => {
            console.log(`Content type changed from ${prevActiveName} to ${activeName}`);
            setRequest({
                ...request,
                body: {}
            })
        }
    )

    const headerParams = operation.parameters?.filter(param => param.in === 'header');
    const queryParams = operation.parameters?.filter(param => param.in === 'query');
    const pathParams = operation.parameters?.filter(param => param.in === 'path');
    const cookieParams = operation.parameters?.filter(param => param.in === 'cookie');

    return (
        <>
            {pathParams?.length !== 0 && (
                <>
                    <SectionHeader>Path params</SectionHeader>
                    <ParamsSection
                        params={pathParams}
                        onHeaderChange={(name, value, indexInArray, parents, location) => onRequestInputChange(RequestObjectType.HEADERS, name, value, indexInArray, parents, location)}
                    />
                </>
            )}
            {queryParams?.length !== 0 && (
                <>
                    <SectionHeader>Query params</SectionHeader>
                    <ParamsSection
                        params={queryParams}
                        onHeaderChange={(name, value, indexInArray, parents, location) => onRequestInputChange(RequestObjectType.HEADERS, name, value, indexInArray, parents, location)}
                    />
                </>
            )}
            {headerParams?.length !== 0 && (
                <>
                    <SectionHeader>Custom headers</SectionHeader>
                    <ParamsSection
                        params={headerParams}
                        onHeaderChange={(name, value, indexInArray, parents, location) => onRequestInputChange(RequestObjectType.HEADERS, name, value, indexInArray, parents, location)}
                    />
                </>
            )}
            {cookieParams?.length !== 0 && (
                <>
                    <SectionHeader>Cookie params</SectionHeader>
                    <ParamsSection
                        params={cookieParams}
                        onHeaderChange={(name, value, indexInArray, parents, location) => onRequestInputChange(RequestObjectType.HEADERS, name, value, indexInArray, parents, location)}
                    />
                </>
            )}
            {operation.requestBody && (
                <>
                    <SectionHeader>Body</SectionHeader>
                    <SchemaSection
                        schema={operation.requestBody.content?.active?.schema}
                        contentType={operation.requestBody.content?.active?.name}
                        onChange={
                            operation.requestBody.content?.active?.name === 'application/json' 
                            ? (name, value, indexInArray, parents, toBeRemoved) => onRequestInputChange(RequestObjectType.BODY, name, value, indexInArray, parents, undefined, toBeRemoved)
                            : (value) => setRequest(request => ({ // 'text/plain'
                                ...request,
                                body: value
                            }))
                        }
                    />
                </>
            )}
            <ResponseSection customResponse={response} />
            <RunButton disabled={pendingRequest} onClick={() => handleApiCall(getCleanRequest(request))}>{`Run`}</RunButton>
        </>
    );
});
