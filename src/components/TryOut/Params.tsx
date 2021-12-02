import { capitalize } from 'lodash';
import * as React from 'react';

import { FieldModel } from '../../services';
import { ParamsSection } from './ParamsSection';
import { SectionHeader } from './styled.elements';

interface ParamsProps {
    params: FieldModel[],
    location: string,
    onChange: any
}

export const Params = ({params, location, onChange}: ParamsProps) => {
    if (!params || !params.length) return null;
    return (
        <>
            <SectionHeader>{`${capitalize(location)} params`}</SectionHeader>
            <ParamsSection
                params={params}
                onChange={onChange}
            />
        </>
    )
}
