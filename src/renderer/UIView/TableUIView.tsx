import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import 'handsontable/dist/handsontable.css';
import Handsontable from 'handsontable';
import TableUIModel from '../UIModel/TableUIModel';
import { HandsonTableSettings } from '../View/HandsonTable/ReferenceTextCellEditor';
import '../View/HandsonTable/ReferenceTextCellRenderer';

require('../View/HandsonTable/ReferenceTextCellEditor');

interface State extends UIViewBaseState {
}

export default class TableUIView extends UIViewBase<TableUIModel, UIViewBaseProps<TableUIModel>, State> {
  private _handsontable: Handsontable;

  constructor(props: UIViewBaseProps<TableUIModel>, context?: any) {
    super(props, context);
    this.add = this.add.bind(this);
    this.state = {
    };
  }

  componentWillReceiveProps (props: UIViewBaseProps<TableUIModel>) {
    const { rowFocus } = props.model;
    if (rowFocus !== undefined && this._handsontable) {
      this._handsontable.selectRows(rowFocus);
    }
  }

  render(): React.ReactNode {
    return (
      <div>
        <div ref={(ref) => this.initHandsontable(ref)} />
        <input type="button" value="+" onClick={this.add} />
      </div>
    );
  }

  public add(): void {
    const { applyAction, model } = this.props;
    applyAction(model.add());
  }

  private initHandsontable(container: HTMLElement | null) {
    if (!container) { return; }
    if (this._handsontable) {
      this._handsontable.updateSettings(this.settings, false);
    } else {
      this._handsontable = new Handsontable(container, this.settings);
      // this._handsontable.addHook('afterBeginEditing', (row: number, column: number) => {
      //   this.props.focus(this.props.model.props.dataPath.push(column).push(row));
      //   console.log('afterBeginEditing', {row, column});
      // });
      // this._handsontable.addHook('afterDeselect', () => {
      //   console.log('afterDeselect');
      // });
      const { rowFocus } = this.props.model;
      if (rowFocus !== undefined && this._handsontable) {
        this._handsontable.selectRows(rowFocus);
      }
    }
  }

  private get settings(): Handsontable.DefaultSettings & HandsonTableSettings {
    return {
      data: this.props.model.rawData(this.props.collectValue),
      afterChange: this.onChange.bind(this),
      cells: this.getColumnSettings.bind(this),
      colHeaders: this.columnHeaders,
      collectValue: this.props.collectValue,
      focus: this.props.focus
    };
  }

  private onChange(changes: any[], source: string): void {
    if (!changes) { return; }
    const { model, applyAction, collectValue } = this.props;
    applyAction(model.inputChanges(collectValue, changes));
  }

  private getColumnSettings(row?: number, col?: number, prop?: object) {
    const { model, collectValue } = this.props;
    return model.columnSettings(collectValue, row, col);
  }

  private get columnHeaders(): Array<string> {
    return this.props.model.definition.contents.map((content: UIDefinitionBase) => content.label).toArray();
  }
}
