// import * as React from 'react';
// import * as CodeMirror from '../../../lib/codemirror/lib/codemirror';
// import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
// import TextAreaUIModel from '../UIModel/TextAreaUIModel';
// import { TemplateLine } from '../Model/TemplateEngine';
// import '../Model/CodeEditor'
//
// interface Props extends UIViewBaseProps {
//   model: TextAreaUIModel;
// }
//
// export default class TextAreaUIView extends UIViewBase<Props, UIViewBaseState> {
//   private _codeMirror: CodeMirror.EditorFromTextArea;
//   private _textArea: HTMLTextAreaElement;
//
//   private static _makeTokenElement(text: string): HTMLSpanElement {
//     const span = document.createElement('span');
//     span.innerText = text;
//     span.className = 'label';
//     return span;
//   }
//
//   render(): React.ReactNode {
//     const { model, dispatch } = this.props;
//     // return this._renderWithCodeMirror();
//     return (
//       <textarea
//         defaultValue={model.text}
//         onChange={() => model.inputText(dispatch, this._textArea.value)}
//         ref={ref => this._initTextArea(ref)}
//         rows={5}
//       />
//     );
//   }
//
//   private _initTextArea(textArea: HTMLTextAreaElement | null): void {
//     if (!textArea || this._codeMirror) { return; }
//     this._codeMirror = CodeMirror.fromTextArea(textArea, {
//       autoCloseBrackets: true,
//       lineNumbers: true,
//       matchBrackets: true
//     });
//     this._codeMirror.setOption('lineNumbers', true);
//     this._codeMirror.setOption('autoCloseBrackets', true);
//     this._codeMirror.on('pick', () => {console.log('pig')});
//     this._codeMirror.on('change', (codeMirror) => {
//       const doc = codeMirror.getDoc();
//       const cursor = doc.getCursor();
//       const line = doc.getLine(cursor.line);
//       const templateLine = new TemplateLine(line);
//       const currentToken = templateLine.getTemplateTokenOn(cursor.ch);
//       console.log('onChange', {cursor, line, currentToken});
//       if (currentToken) {
//         codeMirror.showHint({
//           completeSingle: false,
//           hint: () => {
//             return {
//               from: CodeMirror.Pos(cursor.line, currentToken.start + 2),
//               to: CodeMirror.Pos(cursor.line, currentToken.end),
//               list: [
//                 {
//                   text: 'test }}',
//                   displayText: 'test'
//                 },
//                 {
//                   text: 'test2 }}',
//                   displayText: 'test2'
//                 }
//               ]
//             };
//           }
//         });
//       }
//
//       const viewPort = this._codeMirror.getViewport();
//       for (let lineIndex = viewPort.from; lineIndex < viewPort.to; lineIndex++) {
//         const currentLine = doc.getLine(lineIndex);
//         const templateLine = new TemplateLine(currentLine);
//         for (const token of templateLine.tokens) {
//           if (cursor.line === lineIndex && currentToken && currentToken.start === token.start) {
//             continue;
//           }
//           const span = TextAreaUIView._makeTokenElement(token.key);
//           doc.markText(
//             CodeMirror.Pos(lineIndex, token.start),
//             CodeMirror.Pos(lineIndex, token.end),
//             {
//               replacedWith: span
//             }
//           )
//         }
//       }
//     });
//   }
// }