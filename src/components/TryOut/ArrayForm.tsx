import * as React from 'react';
import { Input, ActionOnArrayButton } from './styled.elements';

enum ArrayAction {
    remove = `remove`,
    add = `add`
}

export const ArrayForm = ({ name, schema, required, onChange, parents }) => {
    const { minItems, maxItems /*items*/ } = schema;
    // const {type: itemsType} = items;
    const [minLength] = React.useState(minItems || required ? 1 : 0);
    const [maxLength] = React.useState(maxItems);
    const [length] = React.useState(minLength || 0);

    const arr: any[] = [];
    for (let i = 0; i < length; i++) {
        arr.push(<Input key={`arr-input-element-${i}`} onChange={(e) => onChange && onChange(name, e.target.value, i, parents)} />);
    }
    const [array, setArray] = React.useState<any>(arr);

    const handleButtonClick = (action: ArrayAction) => {
        switch (action) {
            case ArrayAction.remove: {
                if (array.length - 1 >= minLength) {
                    const newArr = [...array]
                    newArr.pop();
                    onChange && onChange(name, undefined, array.length - 1, parents);
                    setArray(newArr);
                }
                break;
            }
            case ArrayAction.add: {
                if (maxLength && array.length + 1 <= maxLength || !maxLength) {
                    const newArr = [...array];
                    newArr.push(<Input key={`arr-input-element-${array.length}`} onChange={(e) => onChange && onChange(name, e.target.value, array.length, parents)} />);
                    setArray(newArr);
                }
                break;
            }
            default: break;
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", marginBottom: '1rem' }}>
            {array}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                <ActionOnArrayButton
                    disabled={array.length === minLength}
                    onClick={() => handleButtonClick(ArrayAction.remove)}>
                    {`-`}
                </ActionOnArrayButton>
                <ActionOnArrayButton
                    disabled={maxLength ? array.length === maxLength : false}
                    onClick={() => handleButtonClick(ArrayAction.add)}>
                    {`+`}
                </ActionOnArrayButton>
            </div>
        </div>
    );
}
