import * as React from 'react';

import { FieldModel } from '../../services';
import { FormSection } from './FormSection';

interface ParamsSectionProps {
    params: FieldModel[];
    onChange?: any;
}

export const ParamsSection = ({ params, onChange }: ParamsSectionProps) => {
    if (!params || !params.length) {
        return null;
    }
    return (<FormSection items={params} onChange={onChange} />);
}
