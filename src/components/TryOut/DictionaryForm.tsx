import * as _ from 'lodash';
import * as React from 'react';

import { ActionOnArrayButton, Input, RowIcon } from './styled.elements';

const addButtonStyle: React.CSSProperties = { display: "flex", justifyContent: "flex-end", alignItems: "center", fontWeight: 700, cursor: 'pointer' };

const FormRow = ({index, onChange, onRemoveRow, ancestors}) => {
    const [key, setKey] = React.useState('');
    const [value, setValue] = React.useState('');
    const [saved, setSaved] = React.useState(false);
    const [error, setError] = React.useState('');

    const onSavedHandler = () => {
        if (_.isEmpty(key)) {
            setError('Key cannot be empty');
            return;
        }
        onChange && onChange(key, value, undefined, ancestors);
        setSaved(true);
    }

    const handleOnChange = (key, e) => {
        switch (key) {
            case 'key': {
                setKey(e.target.value);
                if (!_.isEmpty(key)) {
                    setError('');
                }
                break;
            }
            case 'value': {
                setValue(e.target.value);
                break;
            }
        }
    }

    const handleRemoveRow = () => {
        onRemoveRow(index);
        onChange && onChange(key, undefined, undefined, ancestors);
    }

    return (
        <>
            <div style={{display: 'flex'}}>
                <Input key={`arr-input-element-key-${index}`} borderColor={_.isEmpty(error) ? 'initial' : 'red'} margin={'0.5rem 0.75rem 0.5rem 0'} placeholder={'key'} disabled={saved} color={saved ? 'lightgrey' : '#1e1e1e'} onChange={(e) => handleOnChange('key', e)} />
                <Input key={`arr-input-element-value-${index}`} margin={'0.5rem 0 0.5rem 0.75rem'} placeholder={'value'} disabled={saved} color={saved ? 'lightgrey' : '#1e1e1e'} onChange={(e) => handleOnChange('value', e)} />
                <RowIcon marginRight={'0.2rem'} color={saved ? '#d3d3d3' : 'green'} cursor={saved ? 'auto' : 'pointer'} onClick={onSavedHandler}>&#10003;</RowIcon>
                <RowIcon color={saved ? 'red' : 'grey'} marginLeft={'0.5rem'} onClick={saved ? handleRemoveRow : f => f}>X</RowIcon>
            </div>
            {!_.isEmpty(error) && (
                <div style={{color: 'red', fontSize: 'smaller'}}>
                    {error}
                </div>
            )}
        </>
    )
}

export const DictionaryForm = ({ onChange, ancestors }) => {
    const [array, setArray] = React.useState<any>([]);

    const handleRemoveRow = (index) => {
        setArray(array => {
            const newArr = array.filter((e) => e.props.index !== index);
            return newArr;
        });
    }

    React.useEffect(() => {
        const arr: any[] = [];
        const key = String((Math.random() + 1).toString(36).substring(7));
        arr.push(<FormRow key={key} index={key} onChange={onChange} ancestors={ancestors} onRemoveRow={handleRemoveRow}/>);
        setArray(arr);
    }, []);

    const handleAddRow = () => {
        setArray(array => {
            const newArr = [...array];
            const key = String((Math.random() + 1).toString(36).substring(7));
            newArr.push(<FormRow key={key} index={key} onChange={onChange} ancestors={ancestors} onRemoveRow={handleRemoveRow}/>);
            return newArr;
        });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {array}
            <div
                style={{...addButtonStyle, color: '#21608a'}}
                onClick={handleAddRow}
            >
                <ActionOnArrayButton
                    disabled={false}>
                    {`+`}
                </ActionOnArrayButton>
                <div>{'Add pair'}</div>
            </div>
        </div>
    );
}