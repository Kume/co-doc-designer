import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import 'handsontable/dist/handsontable.css'
import Handsontable from 'handsontable';
import TableUIModel from '../UIModel/TableUIModel';
import TextUIModel from '../UIModel/TextUIModel';
import CheckBoxUIModel from '../UIModel/CheckBoxUIModel';
import SelectUIModel from '../UIModel/SelectUIModel';

interface Props extends UIViewBaseProps {
  model: TableUIModel;
}

interface State extends UIViewBaseState {
  hottableData: Array<Array<any>>;
}

export default class TableUIView extends UIViewBase<Props, State> {
  private _handsontable: Handsontable;

  constructor(props: Props, context?: any) {
    super(props, context);
    this.state = {
      hottableData: props.model.rawData(props.collectValue)
    };
  }

  render(): React.ReactNode {
    return (
      <div ref={(ref) => this.initHandsontable(ref)} />
    );
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
    const settings: Handsontable.DefaultSettings = {
      data: this.props.model.rawData(this.props.collectValue),
      afterChange: this.onChange.bind(this),
      cells: this.getColumnSettings.bind(this),
      colHeaders: this.columnHeaders
    };
    return settings;
  }

  private onChange(changes: any[], source: string): void {
    if (!changes) { return; }
    console.log({changes});
    this.props.model.inputChanges(this.props.dispatch, this.props.collectValue, changes);
  }

  private getColumnSettings(row?: number, col?: number, prop?: object) {
    const model = this.props.model.dataAt(row!, col!);
    if (model instanceof TextUIModel) {
      if (model.definition.options) {
        return {
          type: 'autocomplete',
          source: model.definition.options,
          strict: false
        };
      } else {
        return {
          type: 'text'
        };
      }
    } else if (model instanceof CheckBoxUIModel) {
      return {
        type: 'checkbox'
      };
    } else if (model instanceof SelectUIModel) {
      return {
        type: 'dropdown',
        source: model.options(this.props.collectValue).map(option => option.label)
      };
    }
    return {};
  }

  private get columnHeaders(): Array<string> {
    return this.props.model.definition.contents.map((content: UIDefinitionBase) => content.title).toArray();
  }
}
