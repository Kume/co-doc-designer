import handsontable, { GridSettings } from 'handsontable';
import * as CodeMirror from '../../../../lib/codemirror/lib/codemirror';
import ReferenceTextEditor from '../ReferenceTextEditor';
import { ReferenceCellSetting } from '../../UIModel/TableRowUIModel';
import { CollectValue } from '../../UIModel/types';
import DataPath from '../../DataModel/Path/DataPath';

export interface HandsonTableSettings {
  collectValue: CollectValue;
  focus: (path: DataPath) => void;
}

interface CodemirrorEvent {
  isImmediatePropagationEnabled: boolean;
}

export default class ReferenceTextCellEditor extends handsontable.editors.TextEditor {
  public textareaParentStyle: CSSStyleDeclaration;
  private textArea: HTMLTextAreaElement;
  private dummyTextArea: HTMLTextAreaElement;
  private textAreaParent: HTMLDivElement;
  private codeMirror: CodeMirror.EditorFromTextArea;
  private value: string;
  private editor: ReferenceTextEditor;
  private readonly state: string;

  public get TEXTAREA(): any {
    return this.dummyTextArea;
  }

  public get TEXTAREA_PARENT(): any {
    return this.textAreaParent;
  }

  createElements() {
    this.textArea = document.createElement('textarea');
    this.textAreaParent = document.createElement('div');
    this.textAreaParent.classList.add('handsontableInputHolder');
    this.textAreaParent.appendChild(this.textArea);
    (this.instance as any).rootElement.appendChild(this.textAreaParent);
    this.textareaParentStyle = this.textAreaParent.style;
    this.textareaParentStyle.minWidth = '0px';
    this.textareaParentStyle.zIndex = '-1';
    this.dummyTextArea = document.createElement('textarea');
    this.dummyTextArea.className = 'copyPaste';
    this.textAreaParent.appendChild(this.dummyTextArea);
    setTimeout(
      () => {
        const settings = this.instance.getSettings() as HandsonTableSettings;
        const cellProperties = this.cellProperties as ReferenceCellSetting;
        this.editor = new ReferenceTextEditor(this.textArea, {
          collectValue: settings.collectValue,
          dataPath: cellProperties.dataPath,
          references: cellProperties.references,
          focus: settings.focus
        });
        this.codeMirror = this.editor.applyCodeMirror();

        this.codeMirror.on('keydown', (codeMirror, event: KeyboardEvent & CodemirrorEvent) => {
          switch (event.code) {
            case 'Enter':
              if (event.altKey) {
                this.editor.breakAtCursor();
                event.isImmediatePropagationEnabled = false;
                event.cancelBubble = true;
              }
              event.preventDefault();
              break;
            case 'Backspace':
            case 'Delete':
              event.isImmediatePropagationEnabled = false;
              event.cancelBubble = true;
              break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
              if (this.isInFullEditMode()) {
                event.isImmediatePropagationEnabled = false;
                event.cancelBubble = true;
              }
              break;
            default:
          }
        });

        // Codemirror内のtextareaをhandsontableの入力と認識させるためのhack
        document.querySelector('.handsontable div.CodeMirror textarea')!.className = 'copyPaste';
      },
      0);
  }

  getValue(): any {
    return this.codeMirror.getValue();
  }

  setValue(value: string): void {
    this.value = value;
    const settings = this.instance.getSettings() as HandsonTableSettings;
    const cellProperties = this.cellProperties as ReferenceCellSetting;
    this.editor.props = {
      collectValue: settings.collectValue,
      dataPath: cellProperties.dataPath,
      references: cellProperties.references,
      focus: settings.focus
    };
  }

  open() {
    if (this.codeMirror) {
      this.codeMirror.setValue(this.value || '');
      this.codeMirror.focus();
      this.dummyTextArea.style.display = 'none';
    }
    super.open();
  }

  prepare(
    row: number,
    col: number,
    prop: string | number,
    TD: HTMLElement,
    originalValue: any,
    cellProperties: GridSettings
  ) {
    this.value = originalValue;
    super.prepare(row, col, prop, TD, originalValue, cellProperties);
  }

  focus(): void {
    if (this.state !== 'STATE_EDITING') {
      this.dummyTextArea.style.display = 'block';
      this.dummyTextArea.select();
    }
  }

  refreshDimensions() {
    super.refreshDimensions();
    this.textareaParentStyle.minWidth = this.dummyTextArea.style.width;
  }
}

handsontable.editors.registerEditor('reference', ReferenceTextCellEditor);