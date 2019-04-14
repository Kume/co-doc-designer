import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import 'handsontable/dist/handsontable.css';
import Handsontable, { GridSettings } from 'handsontable';
import TableUIModel from '../UIModel/TableUIModel';
import { HandsonTableSettings } from '../View/HandsonTable/ReferenceTextCellEditor';
import '../View/HandsonTable/ReferenceTextCellRenderer';
import '../View/HandsonTable/SelectCellEditor';
import '../View/HandsonTable/SelectCellRenderer';
import { TableCellSettingsCache } from '../UIModel/TableUIModelCommon';

require('../View/HandsonTable/ReferenceTextCellEditor');

interface State extends UIViewBaseState {
}

export default class TableUIView extends UIViewBase<TableUIModel, UIViewBaseProps<TableUIModel>, State> {
  private _handsontable: Handsontable;

  constructor(props: UIViewBaseProps<TableUIModel>, context?: any) {
    super(props, context);
    this.state = {
    };
  }

  render(): React.ReactNode {
    return (
      <div>
        <div ref={(ref) => this.initHandsontable(ref)} />
      </div>
    );
  }

  private initHandsontable(container: HTMLElement | null) {
    if (!container) { return; }
    if (this._handsontable) {
      this._handsontable.updateSettings(this.settings, false);
    } else {
      const handsontable: any = new Handsontable(container, this.settings);
      this._handsontable = handsontable;
      // this._handsontable.addHook('afterBeginEditing', (row: number, column: number) => {
      //   this.props.focus(this.props.model.props.dataPath.push(column).push(row));
      //   console.log('afterBeginEditing', {row, column});
      // });
      handsontable.addHook('beforeRemoveRow', (start: number, size: number) => {
        const { model, applyAction } = this.props;
        applyAction(model.deleteRows(start, size));
        return false;
      });
      handsontable.addHook('beforeCreateRow', (start: number, size: number) => {
        const { model, applyAction } = this.props;
        applyAction(model.insertRows(start, size));
        return false;
      });
    }
    const { rowFocus } = this.props.model;
    if (rowFocus !== undefined && this._handsontable) {
      this._handsontable.deselectCell();
      this._handsontable.selectRows(rowFocus);
    }
  }

  private get settings(): Handsontable.DefaultSettings & HandsonTableSettings {
    return {
      data: this.props.model.rawData(this.props.collectValue),
      afterChange: this.onChange,
      cells: this.getCellSettings,
      colHeaders: this.columnHeaders,
      rowHeaders: true,
      collectValue: this.props.collectValue,
      focus: this.props.focus,
      contextMenu: ['row_above', 'row_below', 'remove_row']
    };
  }

  private onChange = (changes: any[], source: string) => {
    if (!changes) { return; }
    const { model, applyAction, collectValue } = this.props;
    applyAction(model.inputChanges(collectValue, changes));
  }

  private cellSettingsCache: TableCellSettingsCache[][] = [];

  private getCellSettingsCache(row: number, col: number): TableCellSettingsCache | undefined {
    const settingRow = this.cellSettingsCache[row];
    return settingRow && settingRow[col];
  }

  private setCellSettingsCache(row: number, col: number, cache: TableCellSettingsCache): void {
    if (!this.cellSettingsCache[row]) {
      this.cellSettingsCache[row] = [];
    }
    this.cellSettingsCache[row][col] = cache;
  }

  private getCellSettings = (row?: number, col?: number, prop?: object) => {
    const { model, collectValue } = this.props;
    const cache = this.getCellSettingsCache(row!, col!);
    const now = (new Date()).getTime();
    if (!cache || !cache.lastCached || cache.lastModel !== model || now - cache.lastCached > 10000) {
      const result = model.cellSettings(collectValue, row, col) as GridSettings;
      this.setCellSettingsCache(row!, col!, { settings: result, lastCached: now, lastModel: model });
      return result;
    } else {
      return cache.settings!;
    }
  }

  private get columnHeaders(): Array<string> {
    return this.props.model.definition.contents.map((content: UIDefinitionBase) => content.label).toArray();
  }
}
