import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import * as Handsontable from 'handsontable';
import TableUIModel from '../UIModel/TableUIModel';
import TextUIModel from '../UIModel/TextUIModel';
import CheckBoxUIModel from '../UIModel/CheckBoxUIModel';
import SelectUIModel from '../UIModel/SelectUIModel';

// 定数未定義エラーを防ぐために適当に定義しておく。
/* tslint:disable */
window['__HOT_BUILD_DATE__'] = '';
window['__HOT_PACKAGE_NAME__'] = '';
window['__HOT_VERSION__'] = '';
window['__HOT_BASE_VERSION__'] = '';
const HotTable = require('react-handsontable');
/* tslint:enable */

interface Props extends UIViewBaseProps {
  model: TableUIModel;
}

interface State extends UIViewBaseState {
  hottableData: Array<Array<any>>;
}

export default class TableUIView extends UIViewBase<Props, State> {
  private static getData(model: TableUIModel): Array<Array<any>> {
    return model.children.map(row => {
      return row!.map(cell => {
        if (cell instanceof TextUIModel) {
          return cell.text;
        } else if (cell instanceof CheckBoxUIModel) {
          return cell.isChecked;
        }
        return '';
      }).toArray();
    }).toArray();
  }

  constructor(props: Props, context?: any) {
    super(props, context);
    this.state = {
      hottableData: TableUIView.getData(props.model)
    };
  }

  render(): React.ReactNode {
    return (
      <HotTable data={TableUIView.getData(this.props.model)} settings={this.settings} />
    );
  }

  private get settings(): Handsontable._Handsontable.DefaultSettings {
    const settings: Handsontable._Handsontable.DefaultSettings = {
      afterChange: this.onChange.bind(this),
      cells: this.getColumnSettings.bind(this),
      colHeaders: this.columnHeaders
    };
    return settings;
  }

  private onChange(changes: any[], source: string): void {
    if (!changes) { return; }
    console.log({changes});
    this.props.model.inputChanges(this.props.dispatch, changes);
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
        source: model.options(this.props.collectValue).map(option => option.value)
      };
    }
    return {};
  }

  private get columnHeaders(): Array<string> {
    return this.props.model.definition.contents.map((content: UIDefinitionBase) => content.title).toArray();
  }
}
