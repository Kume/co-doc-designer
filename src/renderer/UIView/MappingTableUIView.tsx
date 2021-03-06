import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import MappingTableUIModel from '../UIModel/MappingTableUIModel';
import Handsontable, { GridSettings } from 'handsontable';
import { HandsonTableSettings } from '../View/HandsonTable/ReferenceTextCellEditor';
import * as React from 'react';

require('../View/HandsonTable/ReferenceTextCellEditor');

interface State extends UIViewBaseState {
}

export default class MappingTableUIView extends
  UIViewBase<MappingTableUIModel, UIViewBaseProps<MappingTableUIModel>, State> {
  private _handsontable: Handsontable;

  constructor(props: UIViewBaseProps<MappingTableUIModel>, context?: any) {
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
      this._handsontable = new Handsontable(container, this.settings);
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
      colHeaders: this.props.model.columnHeaders(),
      rowHeaders: true,
      collectValue: this.props.collectValue,
      focus: this.props.focus,
      contextMenu: ['row_above', 'row_below', 'remove_row']
    };
  }

  private onChange = (changes: any[], source: string): void => {
    if (!changes) { return; }
    const { model, applyAction, collectValue } = this.props;
    applyAction(model.inputChanges(collectValue, changes));
  }

  private getCellSettings = (row?: number, col?: number, prop?: object) => {
    const { model, collectValue } = this.props;
    return model.cellSettings(collectValue, row, col) as GridSettings;
  }
}