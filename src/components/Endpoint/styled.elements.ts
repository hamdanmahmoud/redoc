import styled from '../../styled-components';

export const OperationEndpointWrap = styled.div`
  cursor: pointer;
  position: relative;
  margin-bottom: 5px;
`;

export const ServerRelativeURL = styled.span`
  font-family: ${props => props.theme.typography.code.fontFamily};
  margin-left: 10px;
  flex: 1;
  overflow-x: hidden;
  text-overflow: ellipsis;
`;

export const EndpointInfo = styled.button<{ $expanded?: boolean; $inverted?: boolean }>`
  color: #326cd1;
  width: 100%;
  text-align: left;
  cursor: pointer;
  background-color: #ffffff;
  display: flex;
  white-space: nowrap;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  border: none;

  .${ServerRelativeURL} {
    color: ${props => (props.$inverted ? props.theme.colors.text.primary : '#ffffff')};
  }
`;

export const HttpVerb = styled.span.attrs((props: { type: string; $compact?: boolean }) => ({
  className: `http-verb ${props.type}`,
}))<{ type: string; $compact?: boolean }>`
  line-height: ${props => (props.$compact ? '18px' : '20px')};
  background-color: ${props => props.theme.colors.http[props.type] || '#999999'};
  color: #494a4a;
  padding: ${props => (props.$compact ? '2px 8px' : '3px 10px')};
  text-transform: capitalize;
  font-family: ${props => props.theme.typography.headings.fontFamily};
  margin: 0;
  border-radius: 20px;
  text-align: center;
  font-size: 12px;
`;

export const TryOutButton = styled.button<{ on: boolean }>`
  outline: 0;
  color: ${props => (props.on ? `#FFFFFF` : `#1E4F70`)};
  text-align: left;
  cursor: pointer;
  padding: 10px 30px 10px 10px;
  background-color: ${props => (props.on ? `#1E4F70` : props.theme.codeBlock.backgroundColor)};
  display: flex;
  white-space: nowrap;
  align-items: center;
  transition: border-color 0.25s ease;
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid #1e4f70;
  border-radius: 3px;
  font-weight: bolder;
`;

export const ServersOverlay = styled.div<{ $expanded: boolean }>`
  position: absolute;
  width: 100%;
  z-index: 100;
  background: ${props => props.theme.rightPanel.servers.overlay.backgroundColor};
  color: ${props => props.theme.rightPanel.servers.overlay.textColor};
  box-sizing: border-box;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.33);
  overflow: hidden;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  transition: all 0.25s ease;
  visibility: hidden;
  // ${props =>
    props.$expanded ? 'visibility: visible;' : 'transform: translateY(-50%) scaleY(0);'}
`;

export const ServerItem = styled.div`
  padding: 10px;
`;

export const ServerUrl = styled.div`
  padding: 5px;
  border: 1px solid #ccc;
  background: ${props => props.theme.rightPanel.servers.url.backgroundColor};
  word-break: break-all;
  color: ${props => props.theme.colors.primary.main};
  > span {
    color: ${props => props.theme.colors.text.primary};
  }
`;
