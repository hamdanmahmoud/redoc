import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { JsonViewer } from '../JsonViewer/JsonViewer';
import { ActionOnArrayButton, Input } from './styled.elements';

enum ArrayAction {
    remove = `remove`,
    add = `add`
}

const containerStyle: React.CSSProperties = { display: "flex", flexDirection: "column", margin: '0.5rem 0rem 2rem 0rem'};
const removeButtonStyle: React.CSSProperties = {position: 'absolute', top: '0.5rem', right: '0.5rem', color: 'red', cursor: 'pointer'};
const addButtonStyle: React.CSSProperties = { display: "flex", justifyContent: "flex-end", alignItems: "center", fontWeight: 700, cursor: 'pointer' };

export const ArrayForm = ({ name, schema, required, onChange, ancestors }) => {
    switch (schema.items.type) {
        case 'string':
        case 'number': {
            const { minItems, maxItems, items } = schema;
            const {type: itemsType} = items;
            const [minLength] = React.useState(minItems || required ? 1 : 0);
            const [maxLength] = React.useState(maxItems);
            const [length] = React.useState(minLength || 0);
        
            // compute and set initial array
            const arr: any[] = [];
            for (let index = 0; index < length; index++) {
                const id = uuidv4();
                arr.push(
                    {
                        id,
                        component: (
                            <div style={{position: 'relative'}}>
                                <Input key={id} onChange={(e) => onChange && onChange(name, itemsType === 'number' ? Number(e.target.value) : e.target.value, index, ancestors)} />
                                <div onClick={() => handleButtonClick(ArrayAction.remove, id, index)} style={removeButtonStyle}>x</div>
                            </div>
                        )
                    }
                );
            }
            const [array, setArray] = React.useState<any>(arr);
        
            const handleButtonClick = (action: ArrayAction, id?: string, index?: number) => {
                switch (action) {
                    case ArrayAction.remove: {
                        setArray(array => {
                            if (array.length - 1 < minLength || !id || index === undefined) return array;
                            const newArr = [...array].filter(element => element.id !== id);
                            onChange && onChange(name, undefined, index, ancestors);
                            return newArr;
                        });
                        break;
                    }
                    case ArrayAction.add: {
                        setArray(array => {
                            if (maxLength && array.length + 1 > maxLength) return array;
                            const newArr = [...array];
                            const id = uuidv4();
                            newArr.push(
                                {
                                    id,
                                    component: (
                                        <div style={{position: 'relative'}}>
                                            <Input key={id} onChange={(e) => onChange && onChange(name, itemsType === 'number' ? Number(e.target.value) : e.target.value, array.length, ancestors)} />
                                            <div onClick={() => handleButtonClick(ArrayAction.remove, id, array.length)} style={removeButtonStyle}>x</div>
                                        </div>
                                    )
                                }
                            );
                            return newArr;
                        });
                        break;
                    }
                    default: break;
                }
            }

            const addButtonDisabled = maxLength && array.length === maxLength;

            return (
                <div style={containerStyle}>
                    {array.map(element => element.component)}
                    <div
                        style={{...addButtonStyle, color: `${addButtonDisabled ? '#AEAEAE' :'#21608a'}`}}
                        onClick={() => handleButtonClick(ArrayAction.add)}
                    >
                        <ActionOnArrayButton
                            disabled={addButtonDisabled}>
                            {`+`}
                        </ActionOnArrayButton>
                        <div>{'Add Element'}</div>
                    </div>
                </div>
            );
            break;
        }
        default: {
            return (
                <div style={containerStyle}>
                    <JsonViewer data={[]} editable hideButtons setParsedJSON={(jsonValue) => onChange && onChange(name, jsonValue, undefined, ancestors)} />
                </div>
            );
            break;
        }
    }
}