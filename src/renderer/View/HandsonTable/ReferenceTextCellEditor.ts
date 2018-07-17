import handsontable from 'handsontable';
import * as CodeMirror from '../../../../lib/codemirror/lib/codemirror';
import ReferenceTextEditor from '../ReferenceTextEditor';
import { ReferenceCellSetting } from '../../UIModel/TableRowUIModel';
import { CollectValue } from '../../UIModel/types';
import DataPath from '../../DataModel/Path/DataPath';

export interface HandsonTableSettings {
  collectValue: CollectValue;
  focus: (path: DataPath) => void;
}

export default class ReferenceTextCellEditor extends handsontable.editors.TextEditor {
  public textareaParentStyle: CSSStyleDeclaration;
  private textArea: HTMLTextAreaElement;
  private textAreaParent: HTMLDivElement;
  private codeMirror: CodeMirror.EditorFromTextArea;
  private value: string;
  private editor: ReferenceTextEditor;

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
    (this.instance as any).rootElement.appendChild(this.textAreaParent);
    this.textareaParentStyle = this.textAreaParent.style;
    this.textareaParentStyle.minWidth = '0px';
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

  focus(): void {
    this.codeMirror.setValue(this.value);
    this.codeMirror.focus();
  }

  refreshDimensions() {
    super.refreshDimensions();
    this.textareaParentStyle.minWidth = this.textArea.style.width;
  }
}

handsontable.editors.registerEditor('reference', ReferenceTextCellEditor);