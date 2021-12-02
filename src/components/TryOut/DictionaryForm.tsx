import * as React from 'react';
import * as _ from 'lodash';

import { Input, RowIcon, ActionOnArrayButton } from './styled.elements';

const FormRow = ({index, onChange, onRemoveRow, parents}) => {
    const [key, setKey] = React.useState('');
    const [value, setValue] = React.useState('');
    const [saved, setSaved] = React.useState(false);
    const [error, setError] = React.useState('');

    const onSavedHandler = () => {
        if (_.isEmpty(key)) {
            setError('Key cannot be empty');
            return;
        }
        onChange && onChange(key, value, undefined, parents);
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
        onChange && onChange(key, value, undefined, parents, true);
    }

    return (
        <>
            <div style={{display: 'flex'}}>
                <Input key={`arr-input-element-key-${index}`} borderColor={_.isEmpty(error) ? 'initial' : 'red'} margin={'0.5rem 0.75rem 0.5rem 0'} placeholder={'key'} disabled={saved} color={saved ? 'lightgrey' : '#1e1e1e'} onChange={(e) => handleOnChange('key', e)} />
                <Input key={`arr-input-element-value-${index}`} margin={'0.5rem 0 0.5rem 0.75rem'} placeholder={'value'} disabled={saved} color={saved ? 'lightgrey' : '#1e1e1e'} onChange={(e) => handleOnChange('value', e)} />
                <RowIcon marginRight={'1.5rem'} color={saved ? '#d3d3d3' : 'green'} cursor={saved ? 'auto' : 'pointer'} onClick={onSavedHandler}>&#10003;</RowIcon>
                <RowIcon onClick={handleRemoveRow}>x</RowIcon>
            </div>
            {!_.isEmpty(error) && (
                <div style={{color: 'red', fontSize: 'smaller'}}>
                    {error}
                </div>
            )}
        </>
    )
}

export const DictionaryForm = ({ onChange, parents }) => {
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
        arr.push(<FormRow key={key} index={key} onChange={onChange} parents={parents} onRemoveRow={handleRemoveRow}/>);
        setArray(arr);
    }, []);

    const handleAddRow = () => {
        setArray(array => {
            const newArr = [...array];
            const key = String((Math.random() + 1).toString(36).substring(7));
            newArr.push(<FormRow key={key} index={key} onChange={onChange} parents={parents} onRemoveRow={handleRemoveRow}/>);
            return newArr;
        });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {array}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
                <ActionOnArrayButton
                    disabled={false}
                    width={'4rem'}
                    onClick={handleAddRow}>
                    {`Add`}
                </ActionOnArrayButton>
            </div>
        </div>
    );
}