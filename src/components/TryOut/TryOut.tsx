import * as React from 'react';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';

import { RequiredLabel, TypeFormat, TypeName, TypePrefix, TypeTitle } from '../../common-elements/fields';
import { ResponseSamples } from '../ResponseSamples/ResponseSamples';
import { FieldModel, OperationModel, SchemaModel } from '../../services';
import { DiscriminatorDropdown } from '../Schema/DiscriminatorDropdown';
import { ShelfIcon } from '../../common-elements/shelfs';
import styled from '../../styled-components';

const ActionOnArrayButton = styled.button<{ disabled: boolean }>`
  border-radius: 20px;
  background-color: ${props => props.disabled ? `#AEAEAE` : `#1E4F70`};
  line-height: 1.5em;
  margin: 0 0.5em 0 0.5 em;
  width: 2em;
  color: #FFFFFF;
  font-weight: bolder;
  outline: none;
  float: right;
  cursor: pointer;
`;

const HorizontalLineWrapper = styled.div<{ width?: string }>`
  margin: auto !important;
  width: ${props => `${props.width || `100%`};`}
`;

const ItemTitle = styled.span`
  padding: 20px 20px 20px 0;
  margin-top: 40px;
  font-size: 1.2em;
  color: #58585B;
  font-weight: 600;
`;

const InputLabel = styled.label`
  color: #1e1e1e;
  font-weight: bolder;
  font-size: 13px;
  padding: 0.5em;
  margin: 0.5em 0.5em 0.5em 0;
  background: transparent;
`;

const TryOutHeader = styled.div`
  color: #58585B;
  font-weight: bold;
  background: transparent;
  font-size: 14px;
  margin: 10% 0% 0% 0%;
`;

const TryOutPanel = styled.div<{ backgroundColor: string}>`
  background-color: ${props => props.backgroundColor || '#F2F2F2'};
  display:flex;
  flex-direction:column;
  color: #59595C;
  font-weight: 100;
  font-size: 14px;
  padding: 25px 20px 25px 20px;
`;

const Input = styled.input`
  padding: 0.5em;
  margin: 0.5em 0em 0.5em 0;
  width: 8rem;
  font-size: 13px;
  color: #1e1e1e;
  background: white;
  border-style: solid;
  border-width: thin;
  border-radius: 4px;
  ::placeholder {
    color: grey;
  }
`;

const RunButton = styled.button<{ disabled: boolean }>`
  border-radius: 20px;
  line-height: 2.5em;
  width: 7em;
  background-color: ${props => props.disabled ? `#AEAEAE` : `#1E4F70`};
  color: #FFFFFF;
  font-weight: bolder;
  outline: none;
  float: right;
  cursor: pointer;
  margin-top: 10px;
`;

enum RequestObjectType {
    HEADERS = 'headers',
    BODY = 'body'
};

enum FormItemType {
    string = 'string',
    integer = 'integer',
    array = 'array',
    any = 'any',
    object = 'object',
};

interface FormItemProps {
    item: FieldModel;
    parents: string[];
    onChange: () => void;
    discriminator?: {
        fieldName: string;
        parentSchema: SchemaModel;
    };
}

const FormItem = observer(({ item, onChange, discriminator, parents = [] }: FormItemProps) => {
    const alignItemsStyle = item.schema.type !== FormItemType.array ? 'center' : 'normal';
    const withSubSchema = !item.schema.isPrimitive && !item.schema.isCircular; 

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: `${alignItemsStyle}`, minHeight: '2.5rem' }}>
                <div>
                    <div onClick={() => withSubSchema ? item.toggle() : f => f} style={{cursor: 'pointer'}}>
                        <InputLabel key={`${item.name}-label`}>{item.name}</InputLabel>
                        {withSubSchema && <ShelfIcon direction={item.expanded ? 'down' : 'right'} />}
                    </div>
                    {item.required && <RequiredLabel rightBelow={true}> required </RequiredLabel>}
                </div>
                <FormItemTypesSwitch item={item} onChange={onChange} discriminator={discriminator} parents={parents}/>
            </div>
            <div style={{transition: '1s', opacity: `${item.expanded ? '1' : '0'}`}}>
                {item.expanded && withSubSchema && (
                    <SchemaSection schema={item.schema} onChange={onChange} parents={[...parents, item.name]} />
                )}
            </div>
        </>
    );
});

const FormItemTypesSwitch = ({ item, onChange, discriminator, parents }) => {
    const { schema, name, example, description, required, format = 'text' } = item;

    switch (schema.type) {
        case FormItemType.string:
        case FormItemType.integer:
            return (
                discriminator && discriminator.fieldName === name
                ? <DiscriminatorDropdown
                parent={discriminator.parentSchema}
                enumValues={schema.enum}
                onChange={(value) => onChange && onChange(name, value, undefined, parents, item.in)}
                />
                : <Input
                placeholder={`${example || description || schema.default || ''}`} // TODO: remove default when we support defaultValue
                type={format}
                // defaultValue={schema.default}
                onChange={(e) => onChange && onChange(name, e.target.value, undefined, parents, item.in)}/>
            );
        case FormItemType.array: {
            const { schema: subSchema } = schema;
            return <ArrayInputs name={name} schema={subSchema} required={required} onChange={onChange} parents={parents} />;
        }
        case FormItemType.object: {
            return (
                <div>
                    <TypePrefix>{schema.typePrefix}</TypePrefix>
                    <TypeName color='black'>{schema.displayType}</TypeName>
                    {schema.displayFormat && (
                    <TypeFormat>
                        {' '}
                        &lt;
                        {schema.displayFormat}
                        &gt;{' '}
                    </TypeFormat>
                    )}
                    {schema.title && <TypeTitle color='black'> ({schema.title}) </TypeTitle>}
                </div>
            );
        }
        default: {
            return <> {`Could not find an item type for this item`} </>
        }
    }
}

const ArrayInputs = ({ name, schema, required, onChange, parents }) => {
    const { minItems, maxItems /*items*/ } = schema;
    // const {type: itemsType} = items;
    const [minLength] = React.useState(minItems || required ? 1 : 0);
    const [maxLength] = React.useState(maxItems);
    const [length] = React.useState(minLength || 0);
    const arr: any[] = [];
    for (let i = 0; i < length; i++) {
        arr.push(<Input onChange={(e) => onChange && onChange(name, e.target.value, i, parents)} />);
    }
    const [array, setArray] = React.useState<any>(arr);

    enum ArrayAction {
        remove = `remove`,
        add = `add`
    }

    const handleButtonClick = (action: ArrayAction) => {
        switch (action) {
            case ArrayAction.remove: {
                if (array.length - 1 >= minLength) {
                    const newArr = [...array]
                    newArr.pop();
                    onChange && onChange(name, undefined, array.length - 1, parents);
                    setArray(newArr);
                }
                break;
            }
            case ArrayAction.add: {
                if (maxLength && array.length + 1 <= maxLength || !maxLength) {
                    const newArr = [...array];
                    newArr.push(<Input onChange={(e) => onChange && onChange(name, e.target.value, array.length, parents)} />);
                    setArray(newArr);
                }
                break;
            }
            default: break;
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {array}
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                <ActionOnArrayButton
                    disabled={array.length === minLength}
                    onClick={() => handleButtonClick(ArrayAction.remove)}>
                    {`-`}
                </ActionOnArrayButton>
                <ActionOnArrayButton
                    disabled={maxLength ? array.length === maxLength : false}
                    onClick={() => handleButtonClick(ArrayAction.add)}>
                    {`+`}
                </ActionOnArrayButton>
            </div>
        </div>
    );
}

interface FormSectionProps {
    title: string;
    items: FieldModel[];
    parents?: string[];
    onChange: () => void;
    discriminator?: {
        fieldName: string;
        parentSchema: SchemaModel;
    };
}

const formColors = ['230', '250'];

const FormSection = ({ title, items, onChange, discriminator, parents = []}: FormSectionProps) => {
    return (
        <div>
            <ItemTitle>{title}</ItemTitle>

            <TryOutPanel backgroundColor={"rgb(" + formColors[parents.length % 2] + "," + formColors[parents.length % 2] + "," + formColors[parents.length % 2] + ")"}>
                {items.map(
                    (item, idx) => <FormItem item={item} parents={parents} key={idx} onChange={onChange} discriminator={discriminator}/>
                )}
            </TryOutPanel>
            <HorizontalLineWrapper width="90%"></HorizontalLineWrapper>
        </div>
    );
};

const ParamsSection = ({ params, onHeaderChange }) => {
    if (!params && params.length) {
        return null;
    }

    return (<FormSection title={``} items={params} onChange={onHeaderChange} />);
}

interface SchemaSectionProps {
    schema?: SchemaModel;
    parents?: string[];
    onChange?: any;
    requestBody?: any;
    setRequestBody?: any;
}

const SchemaSection = observer(({ schema, onChange, parents = [] }: SchemaSectionProps) => {
    if (!schema) return null;

    const hasDiscriminator: boolean = schema!.oneOf ? true : false;
    const hasOwnFields: boolean = schema!.fields && schema!.fields.length !== 0 ? true : false;
    const hasOwnItems: boolean = schema!.items ? true : false;

    const fields: FieldModel[] | undefined = hasDiscriminator
        ? schema!.oneOf![schema!.activeOneOf!].fields
        : (hasOwnFields ? schema!.fields : (hasOwnItems ? schema!.items!.fields : []));

    if (!fields || fields.length === 0) {
        // requestBody stays {}
        return (<>Body has no fields, that usually means expected payload is binary (e.g. uploading images)</>);
    }

    return (
        <FormSection 
            title={``}
            items={fields}
            parents={parents}
            onChange={onChange}
            discriminator={{
                fieldName: schema.discriminatorProp,
                parentSchema: schema,
            }}
        />
    );
});

const getUpdatedArrayFromObject = (object, arrayFieldName, newValue, indexInArray) => {
    if (!object || !object[arrayFieldName]) object[arrayFieldName] = [];
    const newArray = object[arrayFieldName];
    newArray[indexInArray] = newValue;
    return newArray;
}

const getNestedChange = (object, fieldName, fieldValue, indexInArray, parentsCopy: string[]) => {
    if (parentsCopy.length === 0) throw new Error('Cannot traverse nested objects if no parents specified');

    const objectCopy = object;
    while (parentsCopy && parentsCopy.length) {
        const parent = parentsCopy.shift() || 0;
        objectCopy[parent] = parentsCopy.length
            ? objectCopy[parent] || {}
            : {
                ...objectCopy[parent],
                [fieldName]: indexInArray === undefined ? fieldValue : getUpdatedArrayFromObject(objectCopy[parent] || {}, fieldName, fieldValue, indexInArray)
            };
    }
    return object;
}

const getObjectChange = (object, name, value, indexInArray, parents: string[] = []) => {
    return parents.length === 0
        ? {
            [name]: indexInArray !== undefined ? getUpdatedArrayFromObject(object, name, value, indexInArray) : value
        }
        : getNestedChange(object, name, value, indexInArray, parents || []);
}

const getCleanRequest = (request) => {
    const cleanEmptyFields = (obj) => {
        const entries = Object.entries(obj);
        if (entries.length === 0) return obj;
  
        entries.forEach(
          ([key, value]) => {
            _.isEmpty(obj[key].replace(/\s/g, ""))
            ? delete obj[key]
            : value
          }
        );
  
        return obj;
    }
  
    return {
        ...request,
        queryParams: cleanEmptyFields(request.queryParams),
        pathParams: cleanEmptyFields(request.pathParams),
        cookieParams: cleanEmptyFields(request.cookieParams),
        headers: cleanEmptyFields(request.headers)
    }
  } 

interface TryOutProps {
    operation: OperationModel;
    customResponse: any;
    pendingRequest: boolean;
    handleApiCall: (request: any) => void;
}

export const TryOut = ({ operation, customResponse, pendingRequest, handleApiCall }: TryOutProps) => {
    const [request, setRequest] = React.useState({queryParams: {}, pathParams: {}, cookieParams: {}, headers: {}, body: {}});

    const handleRequestChange = (type: RequestObjectType, change) => {
        setRequest(request => ({
            ...request,
            [type]: {
                ...(type === RequestObjectType.HEADERS ? request.headers : request.body),
                ...change
            }
        }));
        
    }

    const onRequestInputChange = (type: RequestObjectType, name: string, value: any, indexInArray?: number, parents?: string[], location?: string) => {
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
                const change = getObjectChange(request[type], name, value, indexInArray, parentsCopy);
                handleRequestChange(type, change);
                break;
            }
        }
    }

    // this currently works only for first level of nesting, TODO: think more general for a depth of n
    reaction(
        () => operation && operation!.requestBody!?.content!?.active!?.schema!?.activeOneOf,
        (activeOneOf, prevActiveOneOf) => {
            const schema = operation && operation!.requestBody!?.content!?.active!?.schema;
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

    const headerParams = operation.parameters?.filter(param => param.in === 'header');
    const queryParams = operation.parameters?.filter(param => param.in === 'query');
    const pathParams = operation.parameters?.filter(param => param.in === 'path');
    const cookieParams = operation.parameters?.filter(param => param.in === 'cookie');

    return (
        <>
            {pathParams?.length !== 0 && (
                <>
                    <TryOutHeader>Path params</TryOutHeader>
                    <ParamsSection
                        params={pathParams}
                        onHeaderChange={(name, value, indexInArray, parents, location) => onRequestInputChange(RequestObjectType.HEADERS, name, value, indexInArray, parents, location)}
                    />
                </>
            )}
            {queryParams?.length !== 0 && (
                <>
                    <TryOutHeader>Query params</TryOutHeader>
                    <ParamsSection
                        params={queryParams}
                        onHeaderChange={(name, value, indexInArray, parents, location) => onRequestInputChange(RequestObjectType.HEADERS, name, value, indexInArray, parents, location)}
                    />
                </>
            )}
            {headerParams?.length !== 0 && (
                <>
                    <TryOutHeader>Custom headers</TryOutHeader>
                    <ParamsSection
                        params={headerParams}
                        onHeaderChange={(name, value, indexInArray, parents, location) => onRequestInputChange(RequestObjectType.HEADERS, name, value, indexInArray, parents, location)}
                    />
                </>
            )}
            {cookieParams?.length !== 0 && (
                <>
                    <TryOutHeader>Cookie params</TryOutHeader>
                    <ParamsSection
                        params={cookieParams}
                        onHeaderChange={(name, value, indexInArray, parents, location) => onRequestInputChange(RequestObjectType.HEADERS, name, value, indexInArray, parents, location)}
                    />
                </>
            )}
            {operation.requestBody && (
                <>
                    <TryOutHeader>Body</TryOutHeader>
                    <SchemaSection
                        schema={operation.requestBody.content!.active!.schema}
                        onChange={(name, value, indexInArray, parents) => onRequestInputChange(RequestObjectType.BODY, name, value, indexInArray, parents)}
                    />
                </>
            )}
            <ResponseSamples customResponse={customResponse} />
            <RunButton disabled={pendingRequest} onClick={() => handleApiCall(getCleanRequest(request))}>{`Run`}</RunButton>
        </>
    );
};
