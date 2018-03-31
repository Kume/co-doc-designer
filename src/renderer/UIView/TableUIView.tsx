import * as React from 'react';
import UIViewBase, { UIViewBaseProps, UIViewBaseState } from './UIViewBase';
import TableUIDefinition from '../UIDefinition/TableUIDefinition';
// import HotTable from 'react-handsontable';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import * as Handsontable from 'handsontable';
import TextUIDefinition from '../UIDefinition/TextUIDefinition';
import CheckBoxUIDefinition from '../UIDefinition/CheckBoxUIDefinition';
import { CollectionDataModel } from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import DataPath from '../DataModel/DataPath';
import ListDataModel from '../DataModel/ListDataModel';
import DataModelFactory from "../DataModel/DataModelFactory";

/* tslint:disable */
window['__HOT_BUILD_DATE__'] = '';
window['__HOT_PACKAGE_NAME__'] = '';
window['__HOT_VERSION__'] = '';
window['__HOT_BASE_VERSION__'] = '';
/* tslint:enable */

const HotTable = require('react-handsontable');

interface Props extends UIViewBaseProps {
  model: TableUIDefinition;
  data: CollectionDataModel;
}

export default class TableUIView extends UIViewBase<Props, UIViewBaseState> {
  render(): React.ReactNode {
    return (
      <HotTable data={this.props.model.toTableData(this.props.data)} settings={this.settings} />
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
    if (this.props.data instanceof ListDataModel) {
      let data: ListDataModel = this.props.data;
      changes.forEach((change: Array<any>) => {
        const row: number = change[0];
        const column: string = change[1];
        const changed: any = change[3];
        let rowData: MapDataModel = data.getValueForIndex(row) as MapDataModel;
        rowData = rowData.setValueForKey(column, DataModelFactory.create(changed));
        data = data.setValueForIndex(row, rowData);
      });
      this.props.onUpdate(new DataPath([]), data);
    }
  }

  private getColumnSettings(row?: number, col?: number, prop?: object) {
    const model = this.props.model.contents.get(col as number);
    if (model instanceof TextUIDefinition) {
      return {
        type: 'text'
      };
    } else if (model instanceof CheckBoxUIDefinition) {
      return {
        type: 'checkbox'
      };
    }
    throw new Error();
  }

  private get columnHeaders(): Array<string> {
    return this.props.model.contents.map((content: UIDefinitionBase) => content.title).toArray();
  }
}
