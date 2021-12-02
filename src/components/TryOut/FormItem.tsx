import * as _ from 'lodash';
import { observer } from 'mobx-react';
import * as React from 'react';

import { RequiredLabel, TypeFormat, TypeName, TypePrefix, TypeTitle } from '../../common-elements/fields';
import { ShelfIcon } from '../../common-elements/shelfs';
import { FieldModel, SchemaModel } from '../../services';
import { DiscriminatorDropdown } from '../Schema/DiscriminatorDropdown';
import { ArrayForm } from './ArrayForm';
import { DictionaryForm } from './DictionaryForm';
import { SchemaSection } from './SchemaSection';
import { Dropdown, Input, Label } from './styled.elements';

const FormItemTypesSwitch = ({ item, onChange, discriminator, ancestors }) => {
    const { schema, name, example, description, required, kind } = item;

    switch (kind) {
        case FormItemKind.field: {
            switch (schema.type) {
                case FormItemType.string: {
                    return (
                        discriminator && discriminator.fieldName === name
                        ? <DiscriminatorDropdown
                        parent={discriminator.parentSchema}
                        enumValues={schema.enum}
                        onChange={(value) => onChange && onChange(name, value, undefined, ancestors, item.in)}
                        />
                        : <Input
                        placeholder={`${example || description || ''}`}
                        type={schema.format || 'text'}
                        onChange={(e) => onChange && onChange(name, e.target.value, undefined, ancestors, item.in)}/>
                    );
                }
                case FormItemType.integer: {
                    return (
                        <Input
                        placeholder={`${example || description || ''}`}
                        type={schema.format || 'text'}
                        onChange={(e) => onChange && onChange(name, !isNaN(Number(e.target.value)) ? Number(e.target.value) : e.target.value, undefined, ancestors, item.in)}/>
                    );
                }
                case FormItemType.boolean: {
                    return (
                        <Dropdown 
                        width={'100%'}
                        onChange={(selectObject) => {onChange && onChange(name, selectObject.target.value === 'true' ? true : false, undefined, ancestors, item.in)}}
                        >
                            <option hidden disabled selected> -- select -- </option>
                            <option value="true">true</option>
                            <option value="false">false</option>
                        </Dropdown>
                    );
                }
                case FormItemType.array: {
                    const { schema: subSchema } = schema;
                    return <ArrayForm name={name} schema={subSchema} required={required} onChange={onChange} ancestors={ancestors} />;
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
                    return <DictionaryForm onChange={onChange} ancestors={ancestors} />;
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
    ancestors: string[];
    onChange: () => void;
    discriminator?: {
        fieldName: string;
        parentSchema: SchemaModel;
    };
}

export const FormItem = observer(({ item, onChange, discriminator, ancestors = [] }: FormItemProps) => {
    const alignItemsStyle = item.schema.type !== FormItemType.array ? 'center' : 'normal';
    const withSubSchema = !item.schema.isPrimitive && !item.schema.isCircular; 

    return (
        <div style={{alignItems: `${(item.schema.type === FormItemType.object ? 'baseline' : 'center')}`}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: `${alignItemsStyle}`, minHeight: '2.5rem', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flexBasis: '50%' }}>
                    <div onClick={() => withSubSchema && item.schema.type === 'object' ? item.toggle() : f => f} style={{cursor: 'pointer'}}>
                        <Label key={`${item.name}-label`}>{item.name !== 'property name*' ? item.name : 'dictionary'}</Label>
                        {withSubSchema && item.schema.type === 'object' && <ShelfIcon direction={item.expanded ? 'down' : 'right'} />}
                    </div>
                    {item.required && <RequiredLabel rightBelow={true}> required </RequiredLabel>}
                </div>
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: '1 0 50%' }}>
                    <FormItemTypesSwitch item={item} onChange={onChange} discriminator={discriminator} ancestors={ancestors}/>
                </div>
            </div>
            <div style={{transition: '1s', opacity: `${item.expanded ? '1' : '0'}`}}>
                {item.expanded && withSubSchema && item.schema.type === 'object' && (
                    <SchemaSection schema={item.schema} onChange={onChange} ancestors={[...ancestors, item.name]} /> // circular dependency intended
                )}
            </div>
        </div>
    );
});
