import { List, Record } from 'immutable';
import UIModel, {
  ActionDispatch,
  CollectValue,
  UIModelProps,
  UIModelPropsDefault,
  UpdateUIModelParams
} from './UIModel';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';
import DataModelBase from '../DataModel/DataModelBase';
import TableUIDefinition from '../UIDefinition/TableUIDefinition';
import CollectionDataModelUtil from '../DataModel/CollectionDataModelUtil';
import MapDataModel from '../DataModel/MapDataModel';
import { createSetValueAction } from './UIModelAction';
import DataPathElement from '../DataModel/DataPathElement';
import UIModelState from './UIModelState';
import DataModelUtil from '../DataModel/DataModelUtil';
import ListDataModel from '../DataModel/ListDataModel';
import TableRowUIModel, { CellData, TableChangeForRow } from './TableRowUIModel';


const TableUIModelRecord = Record({
  ...UIModelPropsDefault,
  rows: List()
});

type TableChange = [number, number, any, any];
type TableChangesByRow = Map<number, TableChangeForRow[]>;

export default class TableUIModel extends TableUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: TableUIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;
  public readonly rows: List<TableRowUIModel>;

  private static rows(
    props: {
      data: DataModelBase | undefined,
      definition: TableUIDefinition,
      dataPath: DataPath,
      editContext: EditContext | undefined
    },
    lastState: UIModelState | undefined
  ): List<TableRowUIModel> {
    const data = CollectionDataModelUtil.asCollectionDataModel(props.data);
    if (!data) { return List(); }
    const definition = props.definition as TableUIDefinition;
    return List(data.mapDataWithIndex((row, index) => {
      return new TableRowUIModel({
        definition,
        dataPath: props.dataPath.push(index),
        data: row,
        editContext: undefined // TODO
      }, undefined); // TODO lastState
    }));
  }

  private static coordinateChanges(changes: Array<TableChange>): TableChangesByRow {
    const changesByRow:TableChangesByRow = new Map();
    for (const change of changes) {
      const [row, column, , after] = change;
      if (!changesByRow.has(row)) { changesByRow.set(row, []); }
      changesByRow.get(row)!.push({column, value: after})
    }
    return new Map(Array.from(changesByRow.entries()).sort((a, b) => a[0] === b[0] ? 0 : a[0] > b[0] ? 1 : - 1));
  }

  constructor(props: UIModelProps, lastState: UIModelState | undefined)
  {
    super({
      ...props,
      rows: TableUIModel.rows({ ...props, definition: props.definition as TableUIDefinition}, lastState)
    });
  }

  public dataAt(row: number, column: number): UIModel | undefined {
    if (row >= 0 && row < this.rows.size) {
      return this.rows.get(row).cellAt(column);
    } else {
      return undefined;
    }
  }

  public rawData(collectValue: CollectValue): CellData[][] {
    return this.rows.map(row => row!.rawData(collectValue)).toArray();
  }

  public inputChanges(dispatch: ActionDispatch, collectValue: CollectValue, changes: Array<TableChange>) {
    const changesByRow = TableUIModel.coordinateChanges(changes);
    changesByRow.forEach((value, key) => {
      const row = this.rows.get(key);
      if (row) {
        row.input(dispatch, collectValue, value);
      } else {
        console.log('');
        dispatch(createSetValueAction(this.dataPath.push(DataPathElement.after), MapDataModel.empty));
        const newRow = new TableRowUIModel({
          definition: this.definition,
          dataPath: this.dataPath.push(key),
          data: MapDataModel.empty, // TODO 設定で初期値を設定できるように
          editContext: undefined, // TODO
        }, undefined); // TODO
        newRow.input(dispatch, collectValue, value);
      }
    });
  }

  updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): this {
    if (DataModelUtil.equals(this.data, data)) {
      return this;
    } else {
      let newModel = this.set('data', data) as this;
      const listData = data instanceof ListDataModel ? data : undefined; // TODO Mapにも対応
      if (listData) {
        const newRows = listData.mapDataWithIndex((rowData, rowIndex) => {
          const oldRowModel = this.rows.get(rowIndex as number);
          if (oldRowModel) {
            return oldRowModel.updateModel({
              data: { value: rowData },
              lastState: undefined // TODO
            });
          } else {
            return new TableRowUIModel({
              definition: this.definition,
              dataPath: this.dataPath.push(rowIndex),
              data: rowData,
              editContext: undefined, // TODO
            }, undefined); // TODO
          }
        });
        newModel = newModel.set('rows', List(newRows)) as this;
      } else {
        if (this.rows.size > 0) {
          newModel = newModel.set('rows', List()) as this;
        }
      }
      return newModel;
    }
  }

  updateEditContext(editContext: EditContext | undefined, lastState: UIModelState | undefined): this {
    return this.set('editContext', editContext) as this;
  }

  updateModel(params: UpdateUIModelParams): this {
    let newModel: this = params.dataPath ? this.set('dataPath', params.dataPath.value) as this : this;
    newModel = params.data ? this.updateData(params.data.value, params.lastState) : newModel;
    newModel = params.editContext ? this.updateEditContext(params.editContext.value, params.lastState) : newModel;
    return newModel;
  }

  getState(lastState: UIModelState | undefined): UIModelState | undefined {
    // Tableで扱うような単純な入力はstateを持たない = Tableもstateを保つ必要がない。今のところは。
    return undefined;
  }
}
