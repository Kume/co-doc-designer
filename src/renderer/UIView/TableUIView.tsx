import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import 'handsontable/dist/handsontable.css'
import Handsontable from 'handsontable';
import TableUIModel from '../UIModel/TableUIModel';
import TextUIModel from '../UIModel/TextUIModel';
import CheckBoxUIModel from '../UIModel/CheckBoxUIModel';
import SelectUIModel from '../UIModel/SelectUIModel';
import '../View/HandsonTable/HandsonKeyValueSelectEditor';

interface Props extends UIViewBaseProps {
  model: TableUIModel;
}

interface State extends UIViewBaseState {
  hottableData: Array<Array<any>>;
}

export default class TableUIView extends UIViewBase<Props, State> {
  private _handsonTable: Handsontable;

  constructor(props: Props, context?: any) {
    super(props, context);
    this.state = {
      hottableData: this.getData(props.model)
    };
  }

  render(): React.ReactNode {
    return (
      <div ref={(ref) => this.initHandsontable(ref)} />
    );
  }

  private initHandsontable(container: HTMLElement | null) {
    if (!container) { return; }
    if (this._handsonTable) {
      this._handsonTable.updateSettings(this.settings, false);
    } else {
      this._handsonTable = new Handsontable(container, this.settings);
    }
  }


  private get settings(): Handsontable.DefaultSettings {
    const settings: Handsontable.DefaultSettings = {
      data: this.getData(this.props.model),
      afterChange: this.onChange.bind(this),
      cells: this.getColumnSettings.bind(this),
      colHeaders: this.columnHeaders
    };
    return settings;
  }

  private getData(model: TableUIModel): Array<Array<any>> {
    return model.children.map(row => {
      return row!.map(cell => {
        if (cell instanceof TextUIModel) {
          return cell.text;
        } else if (cell instanceof CheckBoxUIModel) {
          return cell.isChecked;
        } else if (cell instanceof SelectUIModel) {
          console.log('SelectUIModel @TableUIView', cell.value);
          return cell.labelForValue(this.props.collectValue, cell.value);
        }
        return '';
      }).toArray();
    }).toArray();
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
