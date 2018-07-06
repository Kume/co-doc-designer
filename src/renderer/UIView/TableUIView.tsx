import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import 'handsontable/dist/handsontable.css';
import Handsontable from 'handsontable';
import TableUIModel2 from '../UIModel2/TableUIModel2';

require('../View/HandsonTable/ExtendTextEditor');

interface State extends UIViewBaseState {
}

export default class TableUIView extends UIViewBase<TableUIModel2, UIViewBaseProps<TableUIModel2>, State> {
  private _handsontable: Handsontable;

  constructor(props: UIViewBaseProps<TableUIModel2>, context?: any) {
    super(props, context);
    this.add = this.add.bind(this);
    this.state = {
    };
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
    }
  }

  private get settings(): Handsontable.DefaultSettings {
    console.log('settings', this.props.model.rawData(this.props.collectValue));
    return {
      data: this.props.model.rawData(this.props.collectValue),
      afterChange: this.onChange.bind(this),
      cells: this.getColumnSettings.bind(this),
      colHeaders: this.columnHeaders
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
    return this.props.model.definition.contents.map((content: UIDefinitionBase) => content.title).toArray();
  }
}
