import styled, { css, extensionsHook } from '../styled-components';

const headerFontSize = {
  1: '1.85714em',
  2: '1.57143em',
  3: '1.27em',
};

export const headerCommonMixin = level => css`
  font-family: ${({ theme }) => theme.typography.headings.fontFamily};
  font-weight: ${({ theme }) => theme.typography.headings.fontWeight};
  font-size: ${headerFontSize[level]};
  line-height: ${({ theme }) => theme.typography.headings.lineHeight};
`;

export const H1 = styled.h1`
  ${headerCommonMixin(1)};
  color: ${({ theme }) => theme.colors.text.primary};

  ${extensionsHook('H1')};
`;

export const H2 = styled.h2<{ noMargin?: boolean }>`
  ${headerCommonMixin(2)};
  color: #373838;
  margin: ${({ noMargin }) => (noMargin ? 0 : '')};

  ${extensionsHook('H2')};
`;

export const H3 = styled.h2`
  ${headerCommonMixin(3)};
  color: #373838;

  ${extensionsHook('H3')};
`;

export const RightPanelHeader = styled.h3`
  color: #373838;
  box-shadow:0px 0px 15px 1px #C6C7CA
  width: 40%;
  font-size:14px;
  font-weight:bold;
  ${extensionsHook('RightPanelHeader')};
`;

export const BoldHeader = styled.h5`
  margin: 1em 0 1em 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: black;

  ${extensionsHook('BoldHeader')};
`;
