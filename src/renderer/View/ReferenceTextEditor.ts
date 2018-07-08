import * as CodeMirror from '../../../lib/codemirror/lib/codemirror';
import { TemplateReference } from '../UIDefinition/TextUIDefinition';
import { TemplateLine } from '../Model/TemplateEngine';
import './style/ReferenceTextEditor';

export interface ReferenceTextEditorProps {
  readonly lineNumbers?: boolean;
  readonly reference?: TemplateReference;
}

export default class ReferenceTextEditor {
  public readonly textArea: HTMLTextAreaElement;
  public readonly props: ReferenceTextEditorProps;
  private codeMirror?: CodeMirror.EditorFromTextArea;

  constructor(textArea: HTMLTextAreaElement, props: ReferenceTextEditorProps) {
    this.textArea = textArea;
    this.props = props;
  }

  public applyCodeMirror(): void {
    if (this.codeMirror) { return; }

    const codeMirror = CodeMirror.fromTextArea(this.textArea);
    const { props } = this;
    if (props.lineNumbers) {
      codeMirror.setOption('lineNumbers', true);
    }
    codeMirror.setOption('autoCloseBrackets', true);
    codeMirror.on('change', () => {
      this.tryAutocomplete();
    });

    this.codeMirror = codeMirror;
  }

  public dispose(): void {
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
      this.codeMirror = undefined;
    }
  }

  public setText(text: string): void {
    if (this.codeMirror) {
      this.codeMirror.setValue(text);
    }
  }

  private tryAutocomplete(): void {
    console.log('tryAutocomplete');
    const codeMirror = this.codeMirror!;
    const doc = codeMirror.getDoc();
    const cursor = doc.getCursor();
    const line = doc.getLine(cursor.line);
    const templateLine = new TemplateLine(line);
    const currentToken = templateLine.getTemplateTokenOn(cursor.ch);
    if (currentToken) {
      codeMirror.showHint({
        completeSingle: false,
        hint: () => {
          return {
            from: CodeMirror.Pos(cursor.line, currentToken.start + 2),
            to: CodeMirror.Pos(cursor.line, currentToken.end),
            list: [
              {
                text: 'test }}',
                displayText: 'test',
                render: this.renderOption
              },
              {
                text: 'test2 }}',
                displayText: 'test2',
                render: this.renderOption
              }
            ]
          };
        }
      });
    }
  }

  private renderOption(li, self, data) {
    console.log({li, self, data});
    let html = `
    <div class="name">${data.displayText}</div>
    <div class="value" title=${data.displayValue}>
      aaaaaaあえ
    </div>
  `;

    li.innerHTML = html;
    li.className += ` reference-text-editor-hint type--${data.type}`;
  }
}