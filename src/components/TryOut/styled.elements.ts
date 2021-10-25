import styled from '../../styled-components';

// FormItem 

export const Label = styled.label`
  color: #1e1e1e;
  font-weight: bolder;
  font-size: 13px;
  padding: 0.5em;
  margin: 0.5em 0.5em 0.5em 0;
  background: transparent;
`;

export const Input = styled.input<{ margin?: string, borderColor?: string, color?: string }>`
  padding: 0.5em;
  margin: ${props => props.margin || `0.5em 0em 0.5em 0`};
  width: 8rem;
  font-size: 13px;
  color: ${props => props.color || `#1e1e1e`};
  background: white;
  border-style: solid;
  border-width: thin;
  border-radius: 4px;
  border-color: ${props => props.borderColor || `initial`};
  ::placeholder {
    color: grey;
  }
`;

export const Dropdown = styled.select`
  padding: 0.5em;
  margin: 0.5em 0em 0.5em 0;
  width: 8rem;
  font-size: 13px;
  color: #1e1e1e;
  background: white;
  border-style: solid;
  border-width: thin;
  border-radius: 4px;
  ::placeholder {
    color: grey;
  }
`;

// DictionaryForm

export const RowIcon = styled.i<{ marginRight?: string, color?: string, cursor?: string}>`
  display: inline-block;
  width: ${props => props.theme.spacing.unit * 2}px;
  text-align: center;
  right: ${props => props.theme.spacing.unit * 4}px;
  vertical-align: middle;
  margin-top: 0.5rem;
  margin-right: ${props => props.marginRight || '0.5rem'};
  margin-left: 1.5rem;
  cursor: ${props => props.cursor || 'pointer'};
  font-style: normal;
  color: ${props => props.color || '#666'};
`;

export const ActionOnArrayButton = styled.button<{ disabled: boolean, width?: string }>`
  border-radius: 20px;
  background-color: ${props => props.disabled ? `#AEAEAE` : `#1E4F70`};
  line-height: 1.5em;
  margin: 0 0.25rem;
  width: ${props => props.width || `2em`};
  color: #FFFFFF;
  font-weight: bolder;
  outline: none;
  float: right;
  cursor: pointer;
`;

// TryOut

export const SectionHeader = styled.div`
  color: #58585B;
  font-weight: bold;
  background: transparent;
  font-size: 14px;
  margin: 10% 0% 0% 0%;
`;

export const RunButton = styled.button<{ disabled: boolean }>`
  border-radius: 20px;
  line-height: 2.5em;
  width: 7em;
  background-color: ${props => props.disabled ? `#AEAEAE` : `#1E4F70`};
  color: #FFFFFF;
  font-weight: bolder;
  outline: none;
  float: right;
  cursor: pointer;
  margin-top: 10px;
`;

export const MenuItemLi = styled.li<{ depth: number }>`
  list-style: none inside none;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0;
  background-color:#163E58;

  ${props => (props.depth === 0 ? 'margin-top: 15px' : '')};
`;