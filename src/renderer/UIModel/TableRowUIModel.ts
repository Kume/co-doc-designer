import SelectUIModel from './SelectUIModel';
import TableUIDefinition from '../UIDefinition/TableUIDefinition';
import CheckBoxUIModel from './CheckBoxUIModel';
import { ActionDispatch, CollectValue, UIModelProps, UIModelPropsDefault, UpdateUIModelParams } from './UIModel';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { createSetValueAction } from './UIModelAction';
import { List, Record } from 'immutable';
import EditContext from './EditContext';
import DataPath from '../DataModel/Path/DataPath';
import MapDataModel from '../DataModel/MapDataModel';
import TextUIModel from './TextUIModel';
import UIModel from './UIModel';
import { UIModelFactory } from './UIModelFactory';
import UIModelState from './UIModelState';
import DataModelBase from '../DataModel/DataModelBase';
import DataModelFactory from '../DataModel/DataModelFactory';

const TableRowUIModelRecord = Record({
  ...UIModelPropsDefault,
  cells: List()
});

export type CellData = number | string | undefined | boolean;
export interface TableChangeForRow {
  column: number,
  value: any
}

export default class TableRowUIModel extends TableRowUIModelRecord implements UIModel, UIModelProps {
  public readonly data: DataModelBase | undefined;
  public readonly definition: TableUIDefinition;
  public readonly editContext: EditContext;
  public readonly dataPath: DataPath;
  public readonly cells: List<UIModel>;

  private static cells(props: UIModelProps, lastState: UIModelState | undefined): List<UIModel> {
    const mapData = props.data instanceof MapDataModel ? props.data : undefined;
    const definition = props.definition as TableUIDefinition;
    return definition.contents.map(cellDefinition => {
      const key = cellDefinition!.key;
      let cellData: DataModelBase | undefined = undefined;
      if (key.isKey) {
        cellData = DataModelFactory.fromDataPathElement(props.dataPath.lastElement);
      } else if (key.canBeMapKey) {
        cellData = mapData && mapData.valueForKey(cellDefinition!.key.asMapKey);
      }
      return this.cell(cellData, cellDefinition!, props.dataPath, props.editContext);
    }) as List<UIModel>;
  }

  private static inputValueForModel(dispatch: ActionDispatch, collectValue: CollectValue, model: UIModel, value: any) {
    console.log('inputValueForModel', model, value);
    if (model instanceof TextUIModel) {
      if (typeof value === 'string') {
        model.inputText(dispatch, value);
      }
    } else if (model instanceof CheckBoxUIModel) {
      if (model.canInputValue(value)) {
        model.inputValue(dispatch, value);
      }
    } else if (model instanceof SelectUIModel) {
      model.inputLabel(dispatch, collectValue, value.toString());
    }
  }

  private static cell(
    data: DataModelBase | undefined,
    definition: UIDefinitionBase,
    thisDataPath: DataPath,
    thisEditContext: EditContext | undefined
  ): UIModel {
    const props = {
      data,
      dataPath: thisDataPath.push(definition!.key),
      editContext: undefined, // TODO
      definition
    };
    return UIModelFactory.create(props, undefined);
  }

  public constructor(props: UIModelProps, lastState: UIModelState | undefined) {
    super({
      ...props,
      cells: TableRowUIModel.cells(props, lastState)
    })
  }

  public cellAt(index: number): UIModel | undefined {
    if (index < 0 || index >= this.cells.size) {
      return undefined;
    } else {
      return this.cells.get(index);
    }
  }

  public input(dispatch: ActionDispatch, collectValue: CollectValue, changes: TableChangeForRow[]): void {
    if (!(this.data instanceof MapDataModel)) {
      dispatch(createSetValueAction(this.dataPath, MapDataModel.empty))
    }
    for (const change of changes) {
      const cell = this.cellAt(change.column);
      TableRowUIModel.inputValueForModel(dispatch, collectValue, cell!,　change.value);
    }
  }

  public rawData(collectValue: CollectValue): CellData[] {
    return this.cells.map(cell => {
      if (cell instanceof TextUIModel) {
        return cell.text;
      } else if (cell instanceof CheckBoxUIModel) {
        return cell.isChecked;
      } else if (cell instanceof SelectUIModel) {
        return cell.labelForValue(collectValue, cell.value);
      }
      return '';
    }).toArray();
  }

  getState(lastState: UIModelState | undefined): UIModelState | undefined {
    return undefined;
  }

  updateModel(params: UpdateUIModelParams): this {
    let newModel = this;
    if (params.dataPath) {
      newModel = newModel.set('dataPath', params.dataPath.value) as this;
    }
    if (params.data) {
      newModel = newModel.set('data', params.data.value) as this;
      const mapData = params.data.value instanceof MapDataModel ? params.data.value : undefined;
      if (mapData) {
        const newCells = this.cells.map((oldCell, oldCellIndex) => {
          const key = oldCell!.definition.key;
          let data: DataModelBase | undefined = undefined;
          if (key.isKey) {
            data = DataModelFactory.fromDataPathElement(newModel.dataPath.lastElement);
          } else {
            data = mapData.valueForKey(oldCell!.definition.key.asMapKey);
          }
          return oldCell!.updateModel({
            data: { value: data },
            lastState: undefined
          });
        });
        newModel = newModel.set('cells', newCells) as this;
      }
    }
    return newModel;
  }
}