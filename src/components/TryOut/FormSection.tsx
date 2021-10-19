import * as React from 'react';

import { FieldModel, SchemaModel } from '../../services';
import { FormItem } from './FormItem';
import styled from '../../styled-components';

const Form = styled.div<{ backgroundColor: string}>`
  background-color: ${props => props.backgroundColor || '#F2F2F2'};
  display:flex;
  flex-direction:column;
  color: #59595C;
  font-weight: 100;
  font-size: 14px;
  padding: 25px 20px 25px 20px;
`;

interface FormSectionProps {
    items: FieldModel[];
    parents?: string[];
    onChange: () => void;
    discriminator?: {
        fieldName: string;
        parentSchema: SchemaModel;
    };
}

const formColors = ['230', '250'];

export const FormSection = ({ items, onChange, discriminator, parents = []}: FormSectionProps) => {
    return (
        <Form backgroundColor={"rgb(" + formColors[parents.length % 2] + "," + formColors[parents.length % 2] + "," + formColors[parents.length % 2] + ")"}>
            {items.map(
                (item, idx) => <FormItem item={item} parents={parents} key={idx} onChange={onChange} discriminator={discriminator}/>
            )}
        </Form>
    );
};
