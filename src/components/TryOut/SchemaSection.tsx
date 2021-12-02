import { observer } from 'mobx-react';
import * as React from 'react';

import { FieldModel, SchemaModel } from '../../services';
import styled from '../../styled-components';
import { JsonViewer } from '../JsonViewer/JsonViewer';
import { FormSection } from './FormSection';

const TextArea = styled.textarea`
  margin: 1em 0em;
  width: 100%;
`;

interface SchemaSectionProps {
    schema?: SchemaModel;
    contentType?: string;
    ancestors?: string[];
    onChange?: any;
    requestBody?: any;
}

export const SchemaSection = observer(({ schema, contentType, onChange, ancestors = [] }: SchemaSectionProps) => {
    if (!schema) return null;

    switch (contentType) {
        case 'text/plain': {
            return (
                <TextArea onChange={(e) => onChange(e.target.value)}/>
            );
        }
        default: {
            switch (schema.displayType) {
                case 'objects': {
                    return (
                        <JsonViewer data={[]} editable hideButtons setParsedJSON={(jsonValue) => onChange && onChange(jsonValue)} />
                    );
                }
                default: {
                    if (schema.isPrimitive) {
                        return (
                            <JsonViewer data={''} editable hideButtons setParsedJSON={(jsonValue) => onChange && onChange(jsonValue)} />
                        );
                    }
                    const hasDiscriminator: boolean = schema?.oneOf ? true : false;
                    const hasOwnFields: boolean = schema?.fields && schema?.fields.length !== 0 ? true : false;
                    const hasOwnItems: boolean = schema?.items ? true : false;
                
                    const fields: FieldModel[] | undefined = hasDiscriminator
                        ? schema?.oneOf![schema?.activeOneOf!].fields
                        : (hasOwnFields ? schema?.fields : (hasOwnItems ? schema?.items?.fields : []));
                
                    if (!fields || fields.length === 0) {
                        if (schema.isPrimitive) {
                            return (
                                <JsonViewer data={schema.type === 'string' ? '' : schema.type === 'number' ? 0 : {}} editable hideButtons setParsedJSON={(jsonValue) => onChange && onChange(jsonValue)} />
                            );
                        }
                        return (<>Body has no fields, that usually means expected payload is binary (e.g. uploading images)</>);
                    }
                
                    return (
                        <FormSection 
                            items={fields}
                            ancestors={ancestors}
                            onChange={onChange}
                            discriminator={{
                                fieldName: schema.discriminatorProp,
                                parentSchema: schema,
                            }}
                        />
                    );
                }
            }
        }
    }
});
