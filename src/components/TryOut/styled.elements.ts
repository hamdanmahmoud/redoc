import styled from '../../styled-components';

// FormItem

export const Label = styled.label`
  color: #1e1e1e;
  font-weight: ${props => props.theme.typography.fontWeightRegular};
  font-size: 13px;
  background: transparent;
`;

export const Input = styled.input<{
  margin?: string;
  color?: string;
  backgroundColor?: string;
}>`
  padding: 0.5em;
  margin: ${props => props.margin || `0.5em 0em 0.5em 0`};
  width: 100%;
  font-size: 13px;
  &::file-selector-button {
    border-radius: 8px;
    width: 8em;
    color: ${props => props.color || `#1e1e1e`};
    background-color: ${props => props.backgroundColor};
    line-height: 2.5em;
    font-weight: bolder;
    outline: none;
    cursor: pointer;
    border: none;
  }
  background: white;
  border-style: solid;
  border-width: thin;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
  ::placeholder {
    color: grey;
  }
`;

export const Dropdown = styled.select<{
  width?: string;
  borderStyle?: string;
  outline?: string;
  cursor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
}>`
  padding: 0.5em;
  margin: 0.5em 0em 0.5em 0;
  width: ${props => props.width || '8rem'};
  font-size: 13px;
  color: #1e1e1e;
  background: white;
  border-style: ${props => props.borderStyle || 'solid'};
  border-width: ${props => props.borderWidth || 'thin'};
  border-color: ${props => props.borderColor};
  border-radius: ${props => props.borderRadius || '4px'};
  outline: ${props => props.outline || ''};
  cursor: ${props => props.cursor || ''};
  ::placeholder {
    color: grey;
  }
`;

// TryOut

export const SectionHeader = styled.div`
  color: #373838;
  font-weight: bold;
  background: transparent;
  font-size: 14px;
  margin: 10% 0% 0% 0%;
  display: flex;
  justify-content: space-between;

  &:first-child {
    margin: 0;
  }
`;

export const RunButton = styled.button<{ disabled: boolean }>`
  border-radius: 6px;
  line-height: 2.5em;
  width: 4em;
  background-color: ${props => (props.disabled ? `#AEAEAE` : `#326CD1`)};
  color: #ffffff;
  font-weight: bolder;
  outline: none;
  float: right;
  cursor: pointer;
  margin-top: 10px;
  border: none;
`;
