import * as React from 'react';

import { darken } from 'polished';
import styled from '../../styled-components';
import { MenuItemLabel } from '../SideMenu/styled.elements';

export const SearchWrap = styled.div`
  padding: 5px 0;
  padding-bottom: 30px;
`;

export const SearchInput = styled.input.attrs(() => ({
  className: 'search-input',
}))`
  margin: 9.5% 0% 0% 5.5%;
  background: white;
  border-radius: 4px;
  max-height: 100%;
  width: 89%;
  box-sizing: border-box;
  padding: 5px 10px 5px 35px;
  border: 0;
  border-bottom-color: #4e7a93;
  border-bottom-style: none;
  border-bottom-width: 0px;
  border-bottom: 1px solid #4e7a93;
  font-family: Arial;
  font-weight: 100;
  font-size: 14px;
  color: #373838;
  outline: none;
  line-height: 1.5em;
`;

export const SearchIcon = styled((props: { className?: string }) => (
  <svg
    className={props.className}
    version="1.1"
    viewBox="0 0 1000 1000"
    x="0px"
    xmlns="http://www.w3.org/2000/svg"
    y="0px"
  >
    <path d="M968.2,849.4L667.3,549c83.9-136.5,66.7-317.4-51.7-435.6C477.1-25,252.5-25,113.9,113.4c-138.5,138.3-138.5,362.6,0,501C219.2,730.1,413.2,743,547.6,666.5l301.9,301.4c43.6,43.6,76.9,14.9,104.2-12.4C981,928.3,1011.8,893,968.2,849.4z M524.5,522c-88.9,88.7-233,88.7-321.8,0c-88.9-88.7-88.9-232.6,0-321.3c88.9-88.7,233-88.7,321.8,0C613.4,289.4,613.4,433.3,524.5,522z" />
  </svg>
)).attrs({
  className: 'search-icon',
})`
  position: absolute;
  left: 25px;
  height: 6em;
  width: 1.2em;
  path {
    fill: #626469;
  }
`;

export const SearchResultsBox = styled.div`
  padding: ${props => props.theme.spacing.unit}px 0;
  background-color: transparent;
  color: ${props => props.theme.sidebar.textColor};
  max-height: 200px;
  border-top: ${({ theme }) => darken(0.1, theme.sidebar.backgroundColor)}};
  border-bottom: ${({ theme }) => darken(0.1, theme.sidebar.backgroundColor)}};
  margin-top: 10px;
  line-height: 1.4;
  font-size: 0.9em;
  font-weight: 100;
font-size: 14px;
  li {
    background-color: inherit;
  }

  ${MenuItemLabel} {
    padding-top: 6px;
    padding-bottom: 6px;
    background-color: transparent;

    &:hover,
    &.active {
      background-color: ${({ theme }) => darken(0.05, theme.sidebar.backgroundColor)}};
    }

    > svg {
      display: none;
    }
  }
`;

export const ClearIcon = styled.i`
  position: absolute;
  display: inline-block;
  width: ${props => props.theme.spacing.unit * 2}px;
  text-align: center;
  right: ${props => props.theme.spacing.unit * 8}px;
  line-height: 6em;
  vertical-align: middle;
  margin-right: 2px;
  cursor: pointer;
  font-style: normal;
  color: '#666';
`;
