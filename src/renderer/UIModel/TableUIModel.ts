import { List, Record } from 'immutable';
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault } from './UIModel';
import DataPath from '../DataModel/DataPath';
import EditContext from './EditContext';
import DataModelBase, { CollectionIndex } from '../DataModel/DataModelBase';
import TableUIDefinition from '../UIDefinition/TableUIDefinition';
import { UIModelFactory } from './UIModelFactory';
import CollectionDataModelUtil from '../DataModel/CollectionDataModelUtil';
import MapDataModel from '../DataModel/MapDataModel';
import TextUIModel from './TextUIModel';
import CheckBoxUIModel from './CheckBoxUIModel';
import { createSetValueAction } from './UIModelAction';
import DataModelFactory from '../DataModel/DataModelFactory';
import DataPathElement from '../DataModel/DataPathElement';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import UIModelState from './UIModelState';

const TableUIModelRecord = Record({
  ...UIModelPropsDefault,
  children: List()
});

type TableChange = [number, number, any, any] | null;

interface InsertChange {
  changeIndex: number;
  row: number;
  column: number;
  after: any;
}

export default class TableUIModel extends TableUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: TableUIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;
  public readonly children: List<List<UIModel>>;

  public static children(props: UIModelProps): List<List<UIModel>> {
    const data = CollectionDataModelUtil.asCollectionDataModel(props.data);
    if (!data) { return List(); }
    const definition = props.definition as TableUIDefinition;
    return List(data.mapDataWithIndex((rowData, index) => {
      const rowMapData = rowData instanceof MapDataModel ? rowData : undefined;
      return List<UIModel>(definition.contents.map(content => {
        const childData = rowMapData && rowMapData.valueForKey(content!.key.asMapKey);
        return this.createChildModel(index, childData, content!, props.dataPath, undefined);
      }));
    }));
  }

  private static createChildModel(
    row: CollectionIndex,
    data: DataModelBase | undefined,
    definition: UIDefinitionBase,
    thisDataPath: DataPath,
    thisEditContext: EditContext | undefined
  ): UIModel {
    const props = {
      data,
      dataPath: thisDataPath.push(row).push(definition!.key),
      editContext: undefined, // TODO
      definition
    };
    return UIModelFactory.create(props, undefined);
  }

  private static inputValueForModel(dispatch: ActionDispatch, model: UIModel, value: any) {
    if (model instanceof TextUIModel) {
      if (typeof value === 'string') {
        model.inputText(dispatch, value);
      }
    } else if (model instanceof CheckBoxUIModel) {
      if (model.canInputValue(value)) {
        model.inputValue(dispatch, value);
      }
    }
  }

  constructor(props: UIModelProps, lastState: UIModelState | undefined) {
    super({
      ...props,
      children: TableUIModel.children(props)
    });
  }

  public dataAt(row: number, column: number): UIModel | undefined {
    if (row >= 0 && row < this.children.size) {
      const childrenRow = this.children.get(row);
      if (column >= 0 && column < childrenRow.size) {
        return childrenRow.get(column);
      }
    }
    return undefined;
  }

  public inputChanges(dispatch: ActionDispatch, changes: Array<TableChange>) {
    const insertChanges: Map<number, Array<InsertChange>> = new Map();
    this.eachChanges(changes, (i, row, column, after, model) => {
      if (model) {
        TableUIModel.inputValueForModel(dispatch, model, after);
      } else {
        if (insertChanges.has(row)) {
          insertChanges.get(row)!.push({ changeIndex: i, row, column, after });
        } else {
          insertChanges.set(row, [{ changeIndex: i, row, column, after }]);
        }
      }
    });

    insertChanges.forEach((rowChanges, row) => {
      dispatch(createSetValueAction(this.dataPath.push(DataPathElement.after), DataModelFactory.create({})));
      rowChanges.forEach(change => {
        const content = this.definition.contents.get(change.column);
        const model = TableUIModel.createChildModel(row, undefined, content, this.dataPath, this.editContext);
        TableUIModel.inputValueForModel(dispatch, model, change.after);
      });
    });
  }

  updateData(data: DataModelBase | undefined, lastState: UIModelState | undefined): this {
    return this.set('data', data) as this;
  }

  updateEditContext(editContext: EditContext, lastState: UIModelState | undefined): this {
    return this.set('editContext', editContext) as this;
  }

  getState(lastState: UIModelState | undefined): UIModelState | undefined {
    // Tableで扱うような単純な入力はstateを持たない = Tableもstateを保つ必要がない。今のところは。
    return undefined;
  }

  private eachChanges(
    changes: Array<TableChange>,
    callback: (i: number, row: number, column: number, after: any, model: UIModel | undefined) => void
  ): void {
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const [row, column, , after] = change!;
      const model = this.dataAt(row, column);
      callback(i, row, column, after, model);
    }
  }
}
