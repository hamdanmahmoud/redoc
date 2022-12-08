import * as React from 'react';

import { FieldModel, SchemaModel } from '../../services';
import styled from '../../styled-components';
import { FormItem } from './FormItem';

const Form = styled.div`
  display: flex;
  flex-direction: column;
  color: #59595c;
  font-weight: 100;
  font-size: 14px;
  padding: 25px 20px 25px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
`;

interface FormSectionProps {
  items: FieldModel[];
  ancestors?: string[];
  location?: string;
  onChange: () => void;
  discriminator?: {
    fieldName: string;
    parentSchema: SchemaModel;
  };
}

export const FormSection = ({
  items,
  onChange,
  discriminator,
  ancestors = [],
  location,
}: FormSectionProps) => {
  return (
    <Form>
      {items.map((item, idx) => (
        <FormItem
          key={idx}
          item={item}
          ancestors={ancestors}
          location={location}
          onChange={onChange}
          discriminator={discriminator}
        />
      ))}
    </Form>
  );
};
