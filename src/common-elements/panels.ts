import { SECTION_ATTR } from '../services/MenuStore';
import styled, { media } from '../styled-components';

export const MiddlePanel = styled.div<{ $compact?: boolean }>`
  width: calc(100% - ${props => props.theme.rightPanel.width});
  flex: 0 0 50%;
  margin-right: 36px;

  ${({ $compact, theme }) =>
    media.lessThan('medium', true)`
    width: 100%;
    margin: 0;
    padding: ${`${$compact ? 0 : theme.spacing.sectionVertical}px 0`};
  `};
`;

export const Section = styled.div.attrs(props => ({
  [SECTION_ATTR]: props.id,
}))<{ $underlined?: boolean }>`
  padding: ${props => props.theme.spacing.sectionVertical}px 0;

  &:last-child {
    min-height: calc(100vh + 1px);
  }

  & > &:last-child {
    min-height: initial;
  }

  ${media.lessThan('medium', true)`
    padding: 0;
  `}
  ${({ $underlined }) =>
    ($underlined &&
      `
    position: relative;

    &:not(:last-of-type):after {
      position: absolute;
      bottom: 0;
      width: 100%;
      display: block;
      content: '';
    }
  `) ||
    ''}
`;

export const RightPanel = styled.div`
  color: ${({ theme }) => theme.rightPanel.textColor};
  padding: 40px ${props => props.theme.spacing.sectionHorizontal}px;
  min-height: 470px;
  width: 100%;
  border-radius: 8px;
  border: 2px solid #e0e0e0;

  ${media.lessThan('medium', true)`
    width: 100%;
    padding: ${props =>
      `${props.theme.spacing.sectionVertical}px ${props.theme.spacing.sectionHorizontal}px`};
  `};
`;

export const DarkRightPanel = styled(RightPanel)`
  background-color: ${props => props.theme.rightPanel.backgroundColor};
`;

export const Row = styled.div<{
  background?: string;
  borderRadius?: string;
  padding?: string;
  bordered?: boolean;
}>`
  display: flex;
  width: 100%;
  padding: ${props => props.padding || '0'};
  background: ${props => props.background};
  border-radius: ${props => props.borderRadius};
  border: ${props => (props.bordered ? '2px solid #E0E0E0' : 'none')};

  ${media.lessThan('medium', true)`
    flex-direction: column;
  `};
`;
