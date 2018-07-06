import handsontable from 'handsontable';
import * as CodeMirror from '../../../../lib/codemirror/lib/codemirror';
import { TemplateLine } from '../../Model/TemplateEngine';
import TextAreaUIView from '../../UIView/TextAreaUIView';

export default class ExtendTextEditor extends handsontable.editors.TextEditor {
  public textareaParentStyle: CSSStyleDeclaration;
  private textArea: HTMLTextAreaElement;
  private textAreaParent: HTMLDivElement;
  private codeMirror: CodeMirror.EditorFromTextArea;
  private value: string;

  public get TEXTAREA(): any {
    return this.textArea;
  }

  public get TEXTAREA_PARENT(): any {
    return this.textAreaParent;
  }

  createElements() {
    this.textArea = document.createElement('textarea');
    this.textAreaParent = document.createElement('div');
    this.textAreaParent.classList.add('handsontableInputHolder');
    this.textAreaParent.appendChild(this.textArea);
    this.instance.rootElement.appendChild(this.textAreaParent);
    this.textareaParentStyle = this.textAreaParent.style;
    this.textareaParentStyle.minWidth = '0px';
    console.log('test createElements', this);
    setTimeout(() => {
      this.codeMirror = CodeMirror.fromTextArea(this.TEXTAREA as any, {
        autoCloseBrackets: true,
        matchBrackets: true,
        viewportMargin: 1
      });
      this.codeMirror.on('change', (codeMirror) => {
        codeMirror.getDoc().getAllMarks();
      });
    },0);
  }

  getValue(): any {
    console.log('getValue', this.codeMirror.getValue());
    return this.codeMirror.getValue();
  }

  setValue(value: string): void {
    console.log('setValue', value);
    this.value = value;
  }

  focus(): void {
    console.log('focus');
    this.codeMirror.setValue(this.value);
    this.codeMirror.focus();
    const viewPort = this.codeMirror.getViewport();
    const doc = this.codeMirror.getDoc();
    for (let lineIndex = viewPort.from; lineIndex < viewPort.to; lineIndex++) {
      const currentLine = doc.getLine(lineIndex);
      const templateLine2 = new TemplateLine(currentLine);
      for (const token of templateLine2.tokens) {
        const found = doc.findMarksAt({line: lineIndex, ch: token.start});
        if (found.length > 0) {
          continue;
        }
        const span = document.createElement('span');
        span.innerText = 'あああ';
        span.className = 'label';
        doc.markText(
          CodeMirror.Pos(lineIndex, token.start),
          CodeMirror.Pos(lineIndex, token.end),
          {
            replacedWith: span
          }
        );
      }
    }
    // this.codeMirror.getDoc().setCursor({ch: 2, line: 0});
  }

  initText(): void {

  }

  refreshDimensions() {
    super.refreshDimensions();
    this.textareaParentStyle.minWidth = this.textArea.style.width;
  }
}

handsontable.editors.registerEditor('test', ExtendTextEditor);