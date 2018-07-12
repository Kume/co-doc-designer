import * as CodeMirror from '../../../lib/codemirror/lib/codemirror';
import { TemplateReference } from '../UIDefinition/TextUIDefinition';
import { TemplateLine, TemplateToken } from '../Model/TemplateEngine';
import './style/ReferenceTextEditor';
import DataPath from '../DataModel/Path/DataPath';
import { CollectValue } from '../UIModel/types';
import ReferenceExpression from '../Model/ReferenceExpression';
import ReferenceExpressionResolver from '../Model/ReferenceExpressionResolver';
import * as React from 'react';
import { ReferenceExpressionView } from './ReferenceExpressionView';
import * as ReactDOM from 'react-dom';

export interface ReferenceTextEditorProps {
  readonly lineNumbers?: boolean;
  readonly references?: TemplateReference[];
  readonly dataPath: DataPath;
  readonly collectValue: CollectValue;
  readonly onChange?: (text: string) => void;
}

export default class ReferenceTextEditor {
  public readonly textArea: HTMLTextAreaElement;
  public readonly props: ReferenceTextEditorProps;
  private codeMirror?: CodeMirror.EditorFromTextArea;

  private static _makeTokenElement(expression: ReferenceExpression): HTMLSpanElement {
    const span = document.createElement('span');
    const props = {category: expression.category || '-', keys: expression.keyText};
    ReactDOM.render(React.createElement(ReferenceExpressionView, props), span);
    return span;
  }

  constructor(textArea: HTMLTextAreaElement, props: ReferenceTextEditorProps) {
    this.textArea = textArea;
    this.props = props;
    this.categoryOptions = this.categoryOptions.bind(this);
  }

  public applyCodeMirror(): CodeMirror.EditorFromTextArea {
    if (this.codeMirror) { return this.codeMirror; }

    const codeMirror = CodeMirror.fromTextArea(this.textArea);
    const { props } = this;
    if (props.lineNumbers) {
      codeMirror.setOption('lineNumbers', true);
    }
    codeMirror.setOption('autoCloseBrackets', true);
    codeMirror.on('change', (arg1, arg2) => {
      this.markToken();
    });
    codeMirror.on('viewportChange', (arg1, arg2) => {
      this.markToken();
    });
    codeMirror.on('blur', () => {
      if (this.props.onChange) { this.props.onChange(codeMirror.getValue()); }
    });
    codeMirror.on('cursorActivity', () => {
      this.tryAutocomplete();
      this.markToken();
    });

    return this.codeMirror = codeMirror;
  }

  public dispose(): void {
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
      this.codeMirror = undefined;
    }
  }

  public setText(text: string): void {
    if (this.codeMirror && text !== this.codeMirror.getValue()) {
      this.codeMirror.setValue(text);
    }
  }

  private markToken(): void {
    const codeMirror = this.codeMirror!;
    const doc = codeMirror.getDoc();
    const cursor = doc.getCursor();
    const line = doc.getLine(cursor.line);
    const templateLine = new TemplateLine(line);
    const currentToken = templateLine.getTemplateTokenOn(cursor.ch);
    const viewPort = codeMirror.getViewport();
    const hasFocus = codeMirror.hasFocus();
    for (let lineIndex = viewPort.from; lineIndex <= viewPort.to; lineIndex++) {
      const currentLine = doc.getLine(lineIndex);
      if (!currentLine) { continue; }
      const templateLine2 = new TemplateLine(currentLine);
      for (const token of templateLine2.tokens) {
        if (token.key.trim() === '') {
          continue;
        }
        const found = doc.findMarksAt({line: lineIndex, ch: token.start});
        if (found.length > 0) {
          continue;
        }
        if (hasFocus && cursor.line === lineIndex && currentToken && currentToken.start === token.start) {
          continue;
        }
        const referenceExpression = new ReferenceExpression(token.key);
        const span = ReferenceTextEditor._makeTokenElement(referenceExpression);
        doc.markText(
          CodeMirror.Pos(lineIndex, token.start),
          CodeMirror.Pos(lineIndex, token.end),
          {
            replacedWith: span
          }
        );
      }
    }
  }

  private tryAutocomplete(): void {
    const codeMirror = this.codeMirror!;
    if (!codeMirror.hasFocus()) { return; }
    const doc = codeMirror.getDoc();
    const cursor = doc.getCursor();
    const line = doc.getLine(cursor.line);
    const templateLine = new TemplateLine(line);
    const currentToken = templateLine.getTemplateTokenOn(cursor.ch);
    const { references } = this.props;
    if (currentToken && references) {
      const referenceExpression = new ReferenceExpression(currentToken.key);

      if (referenceExpression.currentType === 'category') {
          codeMirror.showHint({
            completeSingle: false,
            hint: this.categoryOptions(cursor.line, currentToken, referenceExpression.currentKey)
          });
      } else if (referenceExpression.currentType === 'keys' && referenceExpression.category) {
        if (referenceExpression.fixedKeys.length === 0) {
          this.keyOptions(cursor.line, currentToken, referenceExpression);
        } else if (referenceExpression.fixedKeys.length === 1) {
          this.keyOptions(cursor.line, currentToken, referenceExpression);
        }
      }
    }
  }

  private categoryOptions(line: number, token: TemplateToken, searchKey: string) {
    const { references } = this.props;
    const filtered = searchKey
      ? references!.filter(reference => reference.key.startsWith(searchKey))
      : references;
    return () => {
      return {
        from: CodeMirror.Pos(line, token.start + 2),
        to: CodeMirror.Pos(line, token.end - 2),
        list: filtered!.map(reference => {
          return {
            text: reference.key + ':',
            displayText: reference.name,
            render: this.renderOption
          };
        })
      };
    };
  }

  private keyOptions(line: number, token: TemplateToken, referenceExpression: ReferenceExpression): void {
    const { category } = referenceExpression;
    const codeMirror = this.codeMirror!;
    const ref = this.props.references!.find(ref => ref.key === category);
    if (!ref) { return; }
    const resolver = new ReferenceExpressionResolver(
      referenceExpression, ref, this.props.collectValue, this.props.dataPath);
    const hints = resolver.hints;
    if (hints.length > 0) {
      codeMirror.showHint({
        completeSingle: false,
        hint: () => ({
          from: CodeMirror.Pos(line, token.start + 2),
          to: CodeMirror.Pos(line, token.end - (resolver.isLast ? 0 : 2)),
          list: hints.map(hint => ({ ...hint, render: this.renderOption }))
        })
      });
    }
    return;
  }

  private renderOption(li: HTMLElement, self: any, data) {
    li.innerHTML = `
    <span class="description">${data.key || data.text} : ${data.displayText}</span>
  `;
    li.className += ` reference-text-editor-hint type--${data.type}`;
  }
}