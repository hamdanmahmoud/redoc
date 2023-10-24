import { darken } from 'polished';
import { Tabs as ReactTabs } from 'react-tabs';

import styled from '../styled-components';
export { Tab, TabList, TabPanel } from 'react-tabs';
export const Tabs = styled(ReactTabs)`
  > ul {
    list-style: none;
    padding: 0;
    margin: 0 0 32px 0;
    > li {
      &.toggle {
        padding: 3px 8px;
      }
      &:not(.toggle) {
        padding: 8px 0px;
      }
      display: inline-block;
      background-color: white;
      cursor: pointer;
      text-align: center;
      outline: none;
      color: #707070;
      font-size: 0.9em;
      font-weight: bold;
      &.toggle {
        background: white;
        color: #707070;
        border: 2px solid #e0e0e0;
      }
      &.toggle.left-toggle {
        border-radius: 6px 0px 0px 6px;
        border-right: none;
      }
      &.toggle.right-toggle {
        border-radius: 0 6px 6px 0;
        border-left: none;
      }
      &.react-tabs__tab--selected.toggle {
        background: #edf4ff;
        color: #326cd1;
        border: 2px solid #4580e5;
      }
      &:first-child:not(.toggle) {
        margin: 0 17px 0 0;
      }
      &:last-child:not(.toggle):not(:only-of-type) {
        margin: 0 0 0 17px;
      }
      &.react-tabs__tab--selected:not(.toggle):not(.status-code) {
        color: ${({ theme }) => theme.colors.primary.main};
      }
      &.react-tabs__tab--selected:not(.toggle) {
        background: white;
        border-bottom: 3px solid #326cd1;
        border-radius: 2px;
        &:focus {
          background: white;
        }
      }
      &:only-child {
        flex: none;
        min-width: 100px;
        background: white;
      }
      &.tab-success {
        color: ${props => props.theme.colors.responses.success.color};
      }
      &.tab-redirect {
        color: ${props => props.theme.colors.responses.redirect.color};
      }
      &.tab-info {
        color: ${props => props.theme.colors.responses.info.color};
      }
      &.tab-error {
        color: ${props => props.theme.colors.responses.error.color};
      }
    }
  }
  > .react-tabs__tab-panel {
    & > pre {
      margin: 0;
    }
    & > div > pre {
      padding: 0;
    }
  }
`;
export const SmallTabs = styled(Tabs)`
  > ul {
    display: block;
    > li {
      padding: 2px 5px;
      min-width: auto;
      margin: 0 15px 0 0;
      font-size: 13px;
      font-weight: normal;
      border-bottom: 1px dashed;
      color: ${({ theme }) => darken(theme.colors.tonalOffset, theme.rightPanel.textColor)};
      border-radius: 0;
      background: none;
      &:last-child {
        margin-right: 0;
      }
      &.react-tabs__tab--selected {
        color: ${({ theme }) => theme.rightPanel.textColor};
        background: none;
      }
    }
  }
  > .react-tabs__tab-panel {
    & > div,
    & > pre {
      padding: ${props => props.theme.spacing.unit * 2}px 0;
    }
  }
`;
