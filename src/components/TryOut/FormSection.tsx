import * as React from 'react';

import { FieldModel, SchemaModel } from '../../services';
import styled from '../../styled-components';
import { FormItem } from './FormItem';

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
    ancestors?: string[];
    onChange: () => void;
    discriminator?: {
        fieldName: string;
        parentSchema: SchemaModel;
    };
}

const formColors = ['230', '250'];

export const FormSection = ({ items, onChange, discriminator, ancestors = []}: FormSectionProps) => {
    return (
        <Form backgroundColor={"rgb(" + formColors[ancestors.length % 2] + "," + formColors[ancestors.length % 2] + "," + formColors[ancestors.length % 2] + ")"}>
            {items.map(
                (item, idx) => <FormItem item={item} ancestors={ancestors} key={idx} onChange={onChange} discriminator={discriminator}/>
            )}
        </Form>
    );
};
