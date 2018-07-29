import handsontable from 'handsontable';
import Select from 'react-select';
import ReactDOM from 'react-dom';
import * as React from 'react';
import '../style/SelectCellEditor.css';
import { HandsonTableSettings } from './ReferenceTextCellEditor';
import { MultiSelectCellSetting } from '../../UIModel/TableRowUIModel';

interface SelectValue {
  label: string;
  value: string;
}

export default class SelectCellEditor extends handsontable.editors.TextEditor {
  private eventManager: handsontable.plugins.EventManager;
  private textareaParentStyle: CSSStyleDeclaration;
  private textArea: HTMLTextAreaElement;
  private textAreaParent: HTMLDivElement;
  private container: HTMLDivElement;
  private readonly state: string;
  private value?: string[];
  private element: React.CElement<any, any>;

  public get TEXTAREA(): any {
    return this.textArea;
  }

  public get TEXTAREA_PARENT(): any {
    return this.textAreaParent;
  }

  public createElements() {
    this.onChange = this.onChange.bind(this);
    this.textAreaParent = document.createElement('div');
    this.textareaParentStyle = this.textAreaParent.style;
    this.textareaParentStyle.zIndex = '-1';
    this.textArea = document.createElement('textarea');
    this.textArea.className = 'copyPaste';
    this.textAreaParent.appendChild(this.textArea);
    this.container = document.createElement('div');
    this.textAreaParent.appendChild(this.container);
    handsontable.dom.addClass(this.textAreaParent, 'handsontableInputHolder');
    (this.instance as any).rootElement.appendChild(this.textAreaParent);
    setTimeout(() => {
      const settings = this.instance.getSettings() as HandsonTableSettings;
      const cellProperties = this.cellProperties as MultiSelectCellSetting;
      this.element = React.createElement(Select, {
        onChange: this.onChange,
        multi: true,
        options: cellProperties.model.options(settings.collectValue)
      });
      ReactDOM.render(this.element, this.container);
    }, 0);
  }

  public bindEvents(): void {
    this.instance.addHook('afterScrollHorizontally', () => {
      this.refreshDimensions();
    });

    this.instance.addHook('afterScrollVertically', () => {
      this.refreshDimensions();
    });

    this.instance.addHook('afterColumnResize', () => {
      this.refreshDimensions();
      this.focus();
    });

    this.instance.addHook('afterRowResize', () => {
      this.refreshDimensions();
      this.focus();
    });

    this.instance.addHook('afterDestroy', () => {
      this.eventManager.destroy();
    });
  }
  //
  // public prepare(
  //   row: number,
  //   col: number,
  //   prop: string | number,
  //   TD: HTMLElement,
  //   originalValue: any,
  //   cellProperties: GridSettings
  // ) {
  //   handsontable.editors.BaseEditor.prototype.prepare.apply(this, ...arguments);
  // }

  public setValue(value: string | null): void {
    this.value = value ? JSON.parse(value) : [];
    this.rerender();
  }

  public getValue(): string {
    return JSON.stringify(this.value);
  }

  open(): void {
    this.textArea.style.display = 'none';
    super.open();
  }

  focus(): void {
    if (this.state !== 'STATE_EDITING') {
      this.textArea.style.display = 'block';
      this.textArea.select();
    }
  }

  private rerender(): void {
    const settings = this.instance.getSettings() as HandsonTableSettings;
    const cellProperties = this.cellProperties as MultiSelectCellSetting;
    this.element = React.cloneElement(this.element, {
      value: this.value,
      options: cellProperties.model.options(settings.collectValue)
    });
    ReactDOM.render(this.element, this.container);
  }

  private onChange(value: SelectValue | SelectValue[]): void {
    if (Array.isArray(value)) {
      this.value = value.map(v => v.value);
      this.rerender();
    } else {
      this.value = [value.value];
      this.rerender();
    }
  }
}

handsontable.editors.registerEditor('multi_select', SelectCellEditor);