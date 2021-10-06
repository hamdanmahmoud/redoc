import * as React from 'react';
import { observer } from 'mobx-react';
import * as _ from 'lodash';

import { RequiredLabel, TypeFormat, TypeName, TypePrefix, TypeTitle } from '../../common-elements/fields';
import { FieldModel, SchemaModel } from '../../services';
import { DiscriminatorDropdown } from '../Schema/DiscriminatorDropdown';
import { ShelfIcon } from '../../common-elements/shelfs';
import { SchemaSection } from './SchemaSection';
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

const Label = styled.label`
  color: #1e1e1e;
  font-weight: bolder;
  font-size: 13px;
  padding: 0.5em;
  margin: 0.5em 0.5em 0.5em 0;
  background: transparent;
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

const Dropdown = styled.select`
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

const FormItemTypesSwitch = ({ item, onChange, discriminator, parents }) => {
    const { schema, name, example, description, required, format = 'text' } = item;

    switch (schema.type) {
        case FormItemType.string: {
            return (
                discriminator && discriminator.fieldName === name
                ? <DiscriminatorDropdown
                parent={discriminator.parentSchema}
                enumValues={schema.enum}
                onChange={(value) => onChange && onChange(name, value, undefined, parents, item.in)}
                />
                : <Input
                placeholder={`${example || description || ''}`}
                type={format}
                defaultValue={schema.default}
                onChange={(e) => onChange && onChange(name, e.target.value, undefined, parents, item.in)}/>
            );
        }
        case FormItemType.integer: {
            return (
                <Input
                placeholder={`${example || description || ''}`}
                type={format}
                defaultValue={schema.default}
                onChange={(e) => onChange && onChange(name, !isNaN(Number(e.target.value)) ? Number(e.target.value) : e.target.value, undefined, parents, item.in)}/>
            );
        }
        case FormItemType.boolean: {
            return (
                <Dropdown 
                onChange={(selectObject) => {onChange && onChange(name, selectObject.target.value === 'true' ? true : false, undefined, parents, item.in)}}
                >
                    {schema.default === true && (
                        <>
                            <option value="true">true</option>
                            <option value="false">false</option>
                        </>
                    )}
                    {schema.default !== true && (
                        <>
                            <option value="false">false</option>
                            <option value="true">true</option>
                        </>
                    )}
                </Dropdown>
            );
        }
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
        arr.push(<Input key={`arr-input-element-${i}`} onChange={(e) => onChange && onChange(name, e.target.value, i, parents)} />);
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
                    newArr.push(<Input key={`arr-input-element-${array.length}`} onChange={(e) => onChange && onChange(name, e.target.value, array.length, parents)} />);
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

enum FormItemType {
    string = 'string',
    integer = 'integer',
    boolean = 'boolean',
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

export const FormItem = observer(({ item, onChange, discriminator, parents = [] }: FormItemProps) => {
    const alignItemsStyle = item.schema.type !== FormItemType.array ? 'center' : 'normal';
    const withSubSchema = !item.schema.isPrimitive && !item.schema.isCircular; 

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: `${alignItemsStyle}`, minHeight: '2.5rem' }}>
                <div>
                    <div onClick={() => withSubSchema ? item.toggle() : f => f} style={{cursor: 'pointer'}}>
                        <Label key={`${item.name}-label`}>{item.name}</Label>
                        {withSubSchema && <ShelfIcon direction={item.expanded ? 'down' : 'right'} />}
                    </div>
                    {item.required && <RequiredLabel rightBelow={true}> required </RequiredLabel>}
                </div>
                <FormItemTypesSwitch item={item} onChange={onChange} discriminator={discriminator} parents={parents}/>
            </div>
            <div style={{transition: '1s', opacity: `${item.expanded ? '1' : '0'}`}}>
                {item.expanded && withSubSchema && (
                    <SchemaSection schema={item.schema} onChange={onChange} parents={[...parents, item.name]} /> // circular dependency intended
                )}
            </div>
        </>
    );
});