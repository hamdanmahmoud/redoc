import * as React from 'react';

import { SampleControls } from '../../common-elements';
import { CopyButtonWrapper } from '../../common-elements/CopyButtonWrapper';
import { PrismDiv } from '../../common-elements/PrismDiv';
import styled from '../../styled-components';
import { jsonToHTML } from '../../utils/jsonToHtml';
import { OptionsContext } from '../OptionsProvider';
import { jsonStyles } from './style';

export interface JsonProps {
  data: any;
  className?: string;
  editable?: boolean;
  hideButtons?: boolean;
  error?: string | undefined;
  setParsedJSON?: (any) => void;
  setError?: (string) => void;
}

const JsonViewerWrap = styled.div`
  &:hover > ${SampleControls} {
    opacity: 1;
  }
`;

const StatusCodeSpan = styled.div<{ type: string }>`
  size: 10px;
  font-weight: bolder;
  text-align: center;
  background-color: #1e4f70;
  padding: 5px;
  border-radius: 2px;
  margin-bottom: 4px;
  width: 20%;

  color: ${props => props.theme.colors.responses[props.type]?.color};
  background-color: ${props => props.theme.colors.responses[props.type]?.backgroundColor};
  &:focus {
    outline: auto;
    outline-color: ${props => props.theme.colors.responses[props.type]?.color};
  }
`;

class Json extends React.PureComponent<JsonProps> {
  node: HTMLDivElement;

  constructor(props) {
    super(props);
  }

  /**
   * This method is used for real time error feedback
   */
  onInput(e) {
    try {
      JSON.parse(e.currentTarget.textContent || '{}');
      this.props.setError?.(undefined);
    } catch (e) {
      this.props.setError?.('Invalid JSON Payload');
    }
  }

  /**
   * This method will in fact set the new JSON payload state in parent,
   * so contenteditable div can parse JSON into HTML, styling it properly
   */
  onBlur(e) {
    try {
      const parsedJSON = JSON.parse(e.currentTarget.textContent || '{}');
      this.props.setParsedJSON?.(parsedJSON);
      this.props.setError?.(undefined);
    } catch (e) {
      this.props.setError?.('Invalid JSON Payload');
    }
  }

  /**
   * Method is mostly use to track '{' or '[' insertion for autocomplete for a better UX
   */
  onKeyDown(e) {
    const TAB_KEY = 9;
    const LBRACKET_KEY = 219;

    if (e.keyCode === TAB_KEY) {
      e.preventDefault();
      document.execCommand('insertHTML', false, '  ');
    }

    if (e.keyCode === LBRACKET_KEY) {
      e.preventDefault();
      if (e.shiftKey) {
        // curly bracket
        document.execCommand('insertHTML', false, '{}');
      } else {
        // square bracket
        document.execCommand('insertHTML', false, '[]');
      }

      // move cursor in between brackets for a better UX
      const selection = document.getSelection();
      if (selection && selection?.rangeCount > 0) {
        const textNode = selection.focusNode;
        const newOffset = selection.focusOffset - 1;
        if (textNode) {
          selection.collapse(textNode, Math.min((textNode as any).length, newOffset));
        }
      }
    }
  }

  /**
   * This way we ensure only text is pasted, trimming fonts and styles out when copy-pasting text
   */
  onPaste(e) {
    e.preventDefault();
    const plainText = (e.clipboardData || e.originalEvent.clipboardData).getData('text/plain');
    document.execCommand('insertHTML', false, plainText);
  }

  expandAll = () => {
    const elements = this.node.getElementsByClassName('collapsible');
    for (const collapsed of Array.prototype.slice.call(elements)) {
      (collapsed.parentNode as Element)!.classList.remove('collapsed');
    }
  };

  collapseAll = () => {
    const elements = this.node.getElementsByClassName('collapsible');
    // skip first item to avoid collapsing whole object/array
    const elementsArr = Array.prototype.slice.call(elements, 1);

    for (const expanded of elementsArr) {
      (expanded.parentNode as Element)!.classList.add('collapsed');
    }
  };

  clickListener = (event: MouseEvent) => {
    let collapsed;
    const target = event.target as HTMLElement;
    if (target.className === 'collapser') {
      collapsed = target.parentElement!.getElementsByClassName('collapsible')[0];
      if (collapsed.parentElement.classList.contains('collapsed')) {
        collapsed.parentElement.classList.remove('collapsed');
      } else {
        collapsed.parentElement.classList.add('collapsed');
      }
    }
  };

  componentDidMount() {
    this.node!.addEventListener('click', this.clickListener);
  }

  componentWillUnmount() {
    this.node!.removeEventListener('click', this.clickListener);
  }

  render() {
    const { data } = this.props;
    const showFoldingButtons =
      data && Object.values(data).some(value => typeof value === 'object' && value !== null);
    return (
      <CopyButtonWrapper data={this.props.data.content || this.props.data}>
        {({ renderCopyButton }) => (
          <JsonViewerWrap>
            {!this.props.hideButtons && !this.props.error && (
              <SampleControls>
                {renderCopyButton()}
                {showFoldingButtons && (
                  <>
                    <button onClick={this.expandAll}> Expand all </button>
                    <button onClick={this.collapseAll}> Collapse all </button>
                  </>
                )}
              </SampleControls>
            )}
            <>
              {this.props.data.content && !this.props.editable && (
                <StatusCodeSpan type={this.props.data.type}>{this.props.data.code}</StatusCodeSpan>
              )}
              {this.props.error && (
                <StatusCodeSpan type={'error'}>{this.props.error}</StatusCodeSpan>
              )}
              <OptionsContext.Consumer>
                {options => (
                  <PrismDiv
                    className={this.props.className}
                    spellCheck={false}
                    tabIndex={0}
                    // tslint:disable-next-line
                    ref={node => (this.node = node!)}
                    dangerouslySetInnerHTML={{
                      __html: jsonToHTML(
                        this.props.data.content || this.props.data,
                        options.jsonSampleExpandLevel,
                      ),
                    }}
                    contentEditable={this.props.editable}
                    onInput={e => this.props.editable && this.onInput(e)}
                    onKeyDown={e => this.props.editable && this.onKeyDown(e)}
                    onPaste={e => this.props.editable && this.onPaste(e)}
                    onBlur={e => this.props.editable && this.onBlur(e)}
                  />
                )}
              </OptionsContext.Consumer>
            </>
          </JsonViewerWrap>
        )}
      </CopyButtonWrapper>
    );
  }
}

export const JsonViewer = styled(Json)`
  ${jsonStyles};
`;
