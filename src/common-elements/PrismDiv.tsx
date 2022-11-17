import styled, { extensionsHook } from '../styled-components';

export const PrismDiv = styled.div`
  /**
  * Based on prism-dark.css
  */

  code[class*='language-'],
  pre[class*='language-'] {
    /* color: white;
    background: none; */
    text-shadow: 0 -0.1em 0.2em #373838;
    text-align: left;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  @media print {
    code[class*='language-'],
    pre[class*='language-'] {
      text-shadow: none;
    }
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    // color: hsl(30, 20%, 50%);
    color: grey;
  }

  .token.punctuation {
    opacity: 0.7;
  }

  .namespace {
    opacity: 0.7;
  }

  .token.property,
  .token.tag,
  .token.number,
  .token.constant,
  .token.symbol {
    // color: #4a8bb3;
    color: grey;
  }

  .token.boolean {
    color: firebrick;
  }

  .token.string {
    word-break: break-all;
  }

  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    // color: #a0fbaa;
    color: grey;
    & + a,
    & + a:visited {
      // color: #4ed2ba;
      color: grey;
      text-decoration: underline;
    }
  }

  .token.property.string {
    // color: white;
    color: #1e4f70;
  }

  .token.operator,
  .token.entity,
  .token.url,
  .token.variable {
    // color: hsl(40, 90%, 60%);
    color: grey;
  }

  .token.atrule,
  .token.attr-value,
  .token.keyword {
    // color: hsl(350, 40%, 70%);
    color: grey;
  }

  .token.regex,
  .token.important {
    // color: #e90;
    color: grey;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }

  .token.entity {
    cursor: help;
  }

  .token.deleted {
    color: red;
  }

  ${extensionsHook('Prism')};

  outline: none;
`;
