import * as React from 'react';
import { observer } from 'mobx-react';
import * as _ from 'lodash';

import { RequiredLabel, TypeFormat, TypeName, TypePrefix, TypeTitle } from '../../common-elements/fields';
import { FieldModel, SchemaModel } from '../../services';
import { DiscriminatorDropdown } from '../Schema/DiscriminatorDropdown';
import { ShelfIcon } from '../../common-elements/shelfs';
import { SchemaSection } from './SchemaSection';
import { DictionaryForm } from './DictionaryForm';
import { ArrayForm } from './ArrayForm';

import { Input, Dropdown, Label } from './styled.elements';

const FormItemTypesSwitch = ({ item, onChange, discriminator, parents }) => {
    const { schema, name, example, description, required, format = 'text', kind } = item;

    switch (kind) {
        case FormItemKind.field: {
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
                    return <ArrayForm name={name} schema={subSchema} required={required} onChange={onChange} parents={parents} />;
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
        case FormItemKind.additionalProps: {
            switch (schema.type) {
                case FormItemType.string: {
                    return <DictionaryForm onChange={onChange} parents={parents} />;
                }
                default: {
                    return <> {`Could not find an item type for this item`} </>
                }
            }
        }
        default: {
            return <> {`Could not find an item kind for this item`} </>
        }
    }
}

enum FormItemKind {
    field = 'field',
    additionalProps = 'additionalProperties',
};

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
        <div style={{alignItems: `${(item.schema.type === FormItemType.object ? 'baseline' : 'center')}`}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: `${alignItemsStyle}`, minHeight: '2.5rem', flexWrap: 'wrap' }}>
                <div>
                    <div onClick={() => withSubSchema ? item.toggle() : f => f} style={{cursor: 'pointer'}}>
                        <Label key={`${item.name}-label`}>{item.name !== 'property name*' ? item.name : 'dictionary'}</Label>
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
        </div>
    );
});