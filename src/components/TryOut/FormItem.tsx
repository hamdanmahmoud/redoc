import { observer } from 'mobx-react';
import * as React from 'react';

import { RequiredLabel, TypeFormat, TypeName, TypePrefix } from '../../common-elements/fields';
import { ShelfIcon } from '../../common-elements/shelfs';
import { FieldModel, SchemaModel } from '../../services';
import { DiscriminatorDropdown } from '../Schema/DiscriminatorDropdown';
import { JsonViewer } from '../JsonViewer/JsonViewer';
import { ArrayForm, containerStyle } from './ArrayForm';
import { SchemaSection } from './SchemaSection';
import { Dropdown, Input, Label } from './styled.elements';

const FormItemTypesSwitch = ({ item, onChange, discriminator, ancestors, location }) => {
  const { schema, name, example, description, required, kind } = item;
  const { oneOf, activeOneOf } = schema;
  const oneOfSchema = oneOf?.[activeOneOf];

  switch (kind) {
    case FormItemKind.field: {
      switch (schema.type) {
        case FormItemType.string: {
          return discriminator && discriminator.fieldName === name ? (
            <DiscriminatorDropdown
              parent={discriminator.parentSchema}
              enumValues={schema.enum}
              onChange={value =>
                onChange && onChange(name, value, undefined, ancestors, item.in || location)
              }
            />
          ) : (
            <>
              {schema.format === 'binary' ? (
                <Input
                  placeholder={`${example || description || ''}`}
                  type={'file'}
                  color={'white'}
                  backgroundColor={'#326CD1'}
                  onChange={e =>
                    onChange &&
                    onChange(name, e.target.files?.[0], undefined, ancestors, item.in || location)
                  }
                />
              ) : (
                <Input
                  placeholder={`${example || description || ''}`}
                  type={schema.format || 'text'}
                  onChange={e =>
                    onChange &&
                    onChange(name, e.target.value, undefined, ancestors, item.in || location)
                  }
                />
              )}
            </>
          );
        }
        case FormItemType.integer: {
          return (
            <Input
              placeholder={`${example || description || ''}`}
              type={schema.format || 'text'}
              onChange={e =>
                onChange &&
                onChange(
                  name,
                  !isNaN(Number(e.target.value)) ? Number(e.target.value) : e.target.value,
                  undefined,
                  ancestors,
                  item.in || location,
                )
              }
            />
          );
        }
        case FormItemType.boolean: {
          return (
            <Dropdown
              width={'100%'}
              onChange={selectObject => {
                onChange &&
                  onChange(
                    name,
                    selectObject.target.value === 'true' ? true : false,
                    undefined,
                    ancestors,
                    item.in || location,
                  );
              }}
            >
              <option hidden disabled selected>
                {' '}
                -- select --{' '}
              </option>
              <option value="true">true</option>
              <option value="false">false</option>
            </Dropdown>
          );
        }
        case FormItemType.array: {
          const { schema: subSchema } = schema;
          return (
            <ArrayForm
              name={name}
              schema={subSchema}
              required={required}
              onChange={onChange}
              ancestors={ancestors}
              location={item.in || location}
            />
          );
        }
        case FormItemType.object: {
          return (
            <div>
              <TypePrefix>{schema.typePrefix}</TypePrefix>
              <TypeName color="black">{schema.displayType}</TypeName>
              {schema.displayFormat && (
                <TypeFormat>
                  {' '}
                  &lt;
                  {schema.displayFormat}
                  &gt;{' '}
                </TypeFormat>
              )}
            </div>
          );
        }
        case FormItemType.any: {
          if (!oneOfSchema) return null;
          return (
            <SchemaSection
              schema={item.schema}
              onChange={onChange}
              ancestors={[...ancestors, item.name]}
            />
          );
        }
        default: {
          return <> {`Could not find an item type for this item`} </>;
        }
      }
    }
    case FormItemKind.additionalProps: {
      return (
        <div style={containerStyle}>
          <JsonViewer
            data={{}}
            editable
            hideButtons
            setParsedJSON={jsonValue => {
              onChange &&
                onChange(ancestors.pop(), jsonValue, undefined, ancestors, item.in || location);
            }}
          />
        </div>
      );
    }
    default: {
      return <> {`Could not find an item kind for this item`} </>;
    }
  }
};

enum FormItemKind {
  field = 'field',
  additionalProps = 'additionalProperties',
}

enum FormItemType {
  string = 'string',
  integer = 'integer',
  boolean = 'boolean',
  array = 'array',
  any = 'any',
  object = 'object',
}

interface FormItemProps {
  item: FieldModel;
  ancestors: string[];
  location?: string;
  onChange: () => void;
  discriminator?: {
    fieldName: string;
    parentSchema: SchemaModel;
  };
}

export const FormItem = observer(
  ({ item, onChange, discriminator, ancestors = [], location }: FormItemProps) => {
    const { expanded, name, schema } = item;
    const { activeOneOf, oneOf, isCircular, isPrimitive, type } = schema;
    const oneOfSchema = oneOf?.[activeOneOf];
    const withSubSchema = !isPrimitive && !isCircular;
    const isNotDictionary = name !== 'property name*';
    return (
      <div
        style={{
          alignItems: `${type === FormItemType.object || !!oneOfSchema ? 'baseline' : 'center'}`,
        }}
      >
        <div
          style={
            !!oneOfSchema
              ? {}
              : {
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '2.5rem',
                  flexWrap: 'wrap',
                  width: '50%',
                  maxWidth: '100%',
                  marginBottom: '26px',
                }
          }
        >
          <div style={{ minWidth: 0, flexBasis: '50%' }}>
            <div
              onClick={() =>
                isNotDictionary && withSubSchema && type === 'object' ? item.toggle() : f => f
              }
              style={{ cursor: `${isNotDictionary ? 'pointer' : 'auto'}` }}
            >
              <Label key={`${name}-label`}>{isNotDictionary ? name : 'dictionary'}</Label>
              {item.required && <RequiredLabel>*</RequiredLabel>}
              {isNotDictionary && withSubSchema && type === 'object' && (
                <ShelfIcon direction={expanded ? 'down' : 'right'} />
              )}
            </div>
          </div>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              flex: '1 0 50%',
            }}
          >
            <FormItemTypesSwitch
              item={item}
              onChange={onChange}
              discriminator={discriminator}
              ancestors={ancestors}
              location={location}
            />
          </div>
        </div>
        <div style={{ transition: '1s', opacity: `${expanded ? '1' : '0'}` }}>
          {expanded && withSubSchema && type === 'object' && (
            <SchemaSection
              schema={item.schema}
              onChange={onChange}
              ancestors={[...ancestors, name]}
              location={item.in}
            />
          )}
        </div>
      </div>
    );
  },
);
