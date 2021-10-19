import * as React from 'react';
import { observer } from 'mobx-react';

import { FieldModel, SchemaModel } from '../../services';
import { FormSection } from './FormSection';
import styled from '../../styled-components';

const TextArea = styled.textarea`
  margin: 1em 0em;
  width: 100%;
`;

interface SchemaSectionProps {
    schema?: SchemaModel;
    contentType?: string;
    parents?: string[];
    onChange?: any;
    requestBody?: any;
    setRequestBody?: any;
}

export const SchemaSection = observer(({ schema, contentType, onChange, parents = [] }: SchemaSectionProps) => {
    if (!schema) return null;

    switch (contentType) {
        case 'text/plain': {
            return (
                <TextArea onChange={(e) => onChange(e.target.value)}/>
            );
        }
        default: {
            const hasDiscriminator: boolean = schema?.oneOf ? true : false;
            const hasOwnFields: boolean = schema?.fields && schema?.fields.length !== 0 ? true : false;
            const hasOwnItems: boolean = schema?.items ? true : false;
        
            const fields: FieldModel[] | undefined = hasDiscriminator
                ? schema?.oneOf![schema?.activeOneOf!].fields
                : (hasOwnFields ? schema?.fields : (hasOwnItems ? schema?.items?.fields : []));
        
            if (!fields || fields.length === 0) {
                return (<>Body has no fields, that usually means expected payload is binary (e.g. uploading images)</>);
            }
        
            return (
                <FormSection 
                    items={fields}
                    parents={parents}
                    onChange={onChange}
                    discriminator={{
                        fieldName: schema.discriminatorProp,
                        parentSchema: schema,
                    }}
                />
            );
        }
    }
});
