import * as React from 'react';
import * as CodeMirror from '../../../lib/codemirror/lib/codemirror';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import TextAreaUIModel from '../UIModel/TextAreaUIModel';
import { TemplateLine } from '../Model/TemplateEngine';
import '../Model/CodeEditor'

interface Props extends UIViewBaseProps {
  model: TextAreaUIModel;
}

export default class TextAreaUIView extends UIViewBase<Props, UIViewBaseState> {
  private _codeMirror: CodeMirror.EditorFromTextArea;
  private _textArea: HTMLTextAreaElement;

  // _initCodeMirror(component: any) {
  //   if (!component || this._codeMirror) { return; }
  //   this._codeMirror = component.getCodeMirror();
  //   const label: HTMLSpanElement = document.createElement('span');
  //   label.innerText = 'dddd';
  //   label.className = 'label';
  //
  //   this._codeMirror.getDoc().markText({line: 0, ch: 2}, {line: 0, ch: 5}, {
  //     replacedWith: label
  //   });
  //   this._codeMirror.on('change', (codeMirror: CodeMirror.Editor) => {
  //     console.log('onChange', codeMirror, codeMirror.getDoc(), codeMirror.getDoc().getCursor());
  //     OriginalCodeMirror.showHint(codeMirror, {
  //       completeSingle: false,
  //       hint: () => {
  //         return {
  //           from: CodeMirror.Pos(1, 3),
  //           to: CodeMirror.Pos(1, 10),
  //           list: ['test']
  //         };
  //       }
  //     });
  //     // codeMirror.showHint({
  //     //   completeSingle: false,
  //     //   hint: () => {
  //     //     return {
  //     //       from: Pos(1, 3),
  //     //       to: Pos(1, 10),
  //     //       list: ['test']
  //     //     };
  //     //   }
  //     // });
  //   });
  // }

  render(): React.ReactNode {
    const { model, dispatch } = this.props;
    // return this._renderWithCodeMirror();
    return (
      <textarea
        defaultValue={model.text}
        onChange={() => model.inputText(dispatch, this._textArea.value)}
        ref={ref => this._initTextArea(ref)}
        rows={5}
      />
    );
  }

  private _initTextArea(textArea: HTMLTextAreaElement | null): void {
    if (!textArea || this._codeMirror) { return; }
    this._codeMirror = CodeMirror.fromTextArea(textArea, {
      autoCloseBrackets: true,
      lineNumbers: true,
      matchBrackets: true
    });
    this._codeMirror.setOption('lineNumbers', true);
    this._codeMirror.setOption('autoCloseBrackets', true);
    this._codeMirror.on('change', (codeMirror) => {
      const doc = codeMirror.getDoc();
      const cursor = doc.getCursor();
      const line = codeMirror.getDoc().getLine(cursor.line);
      console.log('onChange', codeMirror, codeMirror.getDoc(), {cursor, line});
      const templateLine = new TemplateLine(line);
      const currentToken = templateLine.getTemplateTokenOn(cursor.ch);
      if (currentToken) {
        codeMirror.showHint({
          completeSingle: false,
          hint: () => {
            return {
              from: CodeMirror.Pos(cursor.line, currentToken.start + 2),
              to: CodeMirror.Pos(cursor.line, currentToken.end - 2),
              list: ['test', 'test2']
            };
          }
        });
      }
    });
  }
}