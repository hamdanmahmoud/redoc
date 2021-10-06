import { Tabs as ReactTabs } from 'react-tabs';

import styled from '../styled-components';

export { Tab, TabList, TabPanel } from 'react-tabs';

export const Tabs = styled(ReactTabs)`
  > ul {
    list-style: none;
    padding: 0;
    margin: 0;
    margin: 0 -5px;
    background: white;
    padding-bottom:10px;

    > li {
      padding: 0 1% 3% 1%;  
      display: inline-block;
      background: transparent;
      cursor: pointer;
      text-align: center;
      outline: none;
      color: #0d0d0d;
      font-size: 14px;
      font-weight: lighter;
      margin-right:5%;

      &.react-tabs__tab--selected {
        background: transparent;
        color: #337BA9;
        border-bottom: 3px solid #337BA9;

  

        &:focus {
          outline: auto;
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
    background: white;
    & > pre {
      background: transparent;
      background-color: transparent;
    }

    & > div > pre {
      background-color: #F2F2F2;
      margin-top: 20px;
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
      color:white;
      background: white;
      border-radius: 0;

      &:last-child {
        margin-right: 0;
      }

      &.react-tabs__tab--selected {
        color:white;
        padding: 25px 20px 0px 20px;
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
