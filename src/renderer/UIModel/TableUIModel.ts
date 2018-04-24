import { List, Record } from "immutable";
import UIModel, { ActionDispatch, UIModelProps, UIModelPropsDefault } from "./UIModel";
import DataPath from "../DataModel/DataPath";
import EditContext from "./EditContext";
import DataModelBase, { CollectionIndex } from "../DataModel/DataModelBase";
import TableUIDefinition from "../UIDefinition/TableUIDefinition";
import { UIModelFactory } from "./UIModelFactory";
import CollectionDataModelUtil from "../DataModel/CollectionDataModelUtil";
import MapDataModel from "../DataModel/MapDataModel";
import TextUIModel from "./TextUIModel";
import CheckBoxUIModel from "./CheckBoxUIModel";
import { createSetValueAction } from "./UIModelAction";
import DataModelFactory from "../DataModel/DataModelFactory";
import DataPathElement from "../DataModel/DataPathElement";
import UIDefinitionBase from "../UIDefinition/UIDefinitionBase";

const TableUIModelRecord = Record({
  ...UIModelPropsDefault,
  children: List()
});

type TableChange = [number, number, any, any] | null

interface InsertChange {
  changeIndex: number,
  row: number,
  column: number,
  after: any
}

export default class TableUIModel extends TableUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: TableUIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;
  public readonly children: List<List<UIModel>>;

  constructor(props: UIModelProps) {
    console.log('Created table ui model');
    super({
      ...props,
      children: TableUIModel.children(props)
    });
  }

  public static children(props: UIModelProps): List<List<UIModel>> {
    const data = CollectionDataModelUtil.asCollectionDataModel(props.data);
    if (!data) { return List(); }
    const definition = props.definition as TableUIDefinition;
    return List(data.mapDataWithIndex((rowData, index) => {
      const rowMapData = rowData instanceof MapDataModel ? rowData : undefined;
      return List<UIModel>(definition.contents.map(content => {
        const data = rowMapData && rowMapData.valueForKey(content!.key.asMapKey);
        return this.createChildModel(index, data, content!, props.dataPath, undefined);
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
    return UIModelFactory.create({
      data,
      dataPath: thisDataPath.push(row).push(definition!.key),
      editContext: undefined, // TODO
      definition
    });
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

  private eachChanges(
    changes: Array<TableChange>,
    callback:(i: number, row: number, column: number, after: any, model: UIModel | undefined) => void
  ): void {
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const [row, column, , after] = change!;
      const model = this.dataAt(row, column);
      callback(i, row, column, after, model);
    }
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

  public filterChanges(changes: Array<TableChange>) {

  }

  public inputChanges(dispatch: ActionDispatch, changes: Array<TableChange>) {
    const insertChanges:Map<number, Array<InsertChange>> = new Map();
    this.eachChanges(changes, (i, row, column, after, model) => {
      if (model) {
        TableUIModel.inputValueForModel(dispatch, model, after)
      } else {
        if (insertChanges.has(row)) {
          insertChanges.get(row)!.push({ changeIndex: i, row, column, after });
        } else {
          insertChanges.set(row, [{ changeIndex: i, row, column, after }])
        }
      }
    });

    insertChanges.forEach((changes, row) => {
      dispatch(createSetValueAction(this.dataPath.push(DataPathElement.after), DataModelFactory.create({})));
      changes.forEach(change => {
        const content = this.definition.contents.get(change.column);
        const model = TableUIModel.createChildModel(row, undefined, content, this.dataPath, this.editContext);
        TableUIModel.inputValueForModel(dispatch, model, change.after)
      });
    })
  }

  public inputChange(dispatch: ActionDispatch, change: TableChange) {

  }

  public get propsObject(): UIModelProps {
    return {
      definition: this.definition,
      dataPath: this.dataPath,
      data: this.data,
      editContext: this.editContext
    }
  }

  updateData(data: DataModelBase | undefined): this {
    return this.set('data', data) as this;
  }

  updateEditContext(editContext: EditContext): this {
    return this.set('editContext', editContext) as this;
  }
}
