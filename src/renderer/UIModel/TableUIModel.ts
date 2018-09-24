import UIModel, { MultiContentUIModel, UIModelProps, UIModelStateNode } from './UIModel';
import TableUIDefinition from '../UIDefinition/TableUIDefinition';
import { CollectionDataModel, CollectionIndex } from '../DataModel/DataModelBase';
import { CollectionDataModelType } from '../DataModel/CollectionDataModelUtil';
import DataModelBase from '../DataModel/DataModelBase';
import MapDataModel from '../DataModel/MapDataModel';
import ListDataModel from '../DataModel/ListDataModel';
import DataPathElement from '../DataModel/Path/DataPathElement';
import TableRowUIModel, { CellData } from './TableRowUIModel';
import { CollectValue } from './types';
import { TableChangeForRow } from './TableRowUIModel';
import { UIModelAction, UIModelFocusAction, UIModelUpdateDataAction } from './UIModelActions';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import { InsertDataAction } from '../DataModel/DataAction';

type TableChange = [number, number, any, any];
type TableChangesByRow = Map<number, TableChangeForRow[]>;

export default class TableUIModel extends MultiContentUIModel<TableUIDefinition, number> {
  private _childIndexes: number[];

  private static coordinateChanges(changes: Array<TableChange>): TableChangesByRow {
    const changesByRow: TableChangesByRow = new Map();
    for (const change of changes) {
      const [row, column, , after] = change;
      if (!changesByRow.has(row)) { changesByRow.set(row, []); }
      changesByRow.get(row)!.push({column, value: after});
    }
    return new Map(Array.from(changesByRow.entries()).sort((a, b) => a[0] === b[0] ? 0 : a[0] > b[0] ? 1 : - 1));
  }

  public rawData(collectValue: CollectValue): CellData[][] {
    const data: CellData[][] = [];
    this.children.forEach(child => {
      data.push((child as TableRowUIModel).rawData(collectValue));
    });
    return data;
  }

  public inputChanges(collectValue: CollectValue, changes: TableChange[]): UIModelAction[] {
    let actions: UIModelAction[] = [];
    if (!this.collectionData) {
      actions.push(UIModelAction.Creators.setData(this.props.dataPath, this.definition.defaultData));
    }

    const changesByRow = TableUIModel.coordinateChanges(changes);
    const createdForRow: Map<number, TableRowUIModel> = new Map();
    const {dataPath, modelPath } = this.props;

    changesByRow.forEach((value, key) => {
      const row = this.children.get(key) as TableRowUIModel | undefined;
      if (row) {
        actions = actions.concat(row.input(collectValue, value));
      } else {
        if (!createdForRow.has(key)) {
          actions.push(UIModelAction.Creators.appendData(this.props.dataPath, this.definition.defaultRowData));
          const newChildProps = new UIModelProps({
            stateNode: undefined,
            dataPath: dataPath.push(key),
            modelPath: modelPath.push(key),
            focusedPath: undefined,
            data: this.definition.defaultRowData,
            key: this.selectedKey(key)
          });
          createdForRow.set(key, new TableRowUIModel(this.childDefinitionAt(key), newChildProps));
        }
        actions = actions.concat(createdForRow.get(key)!.input(collectValue, value));
      }
    });
    if (actions.length > 0) {
      actions.push({ type: 'Focus', path: this.props.dataPath } as UIModelFocusAction);
    }
    return actions;
  }

  public deleteRows(start: number, size: number): UIModelAction[] {
    let actions: UIModelAction[] = [];
    if (!this.collectionData) {
      actions.push(UIModelAction.Creators.setData(this.props.dataPath, this.definition.defaultData));
    }

    for (let i = 0; i < size; i++) {
      actions.push(UIModelAction.Creators.deleteData(this.props.dataPath, start));
    }
    if (actions.length > 0) {
      actions.push({ type: 'Focus', path: this.props.dataPath } as UIModelFocusAction);
    }
    return actions;
  }

  public insertRows(start: number, size: number) {
    let actions: UIModelAction[] = [];
    if (!this.collectionData) {
      actions.push(UIModelAction.Creators.setData(this.props.dataPath, this.definition.defaultData));
    }

    for (let i = 0; i < size; i++) {
      actions.push(UIModelAction.Creators.insertData(this.props.dataPath, this.definition.defaultData, i + start));
    }
    if (actions.length > 0) {
      actions.push({ type: 'Focus', path: this.props.dataPath } as UIModelFocusAction);
    }
    return actions;
  }

  public add(): UIModelAction[] {
    const actions: UIModelAction[] = [];

    if (!this.collectionData) {
      actions.push(UIModelAction.Creators.setData(this.props.dataPath, this.definition.defaultData));
    }

    actions.push(<UIModelUpdateDataAction> {
      type: 'UpdateData',
      path: this.props.dataPath,
      dataAction: <InsertDataAction> {
        isAfter: true,
        data: MapDataModel.create([]),
        type: 'Insert'
      }
    });
    return actions;
  }

  public get rowFocus(): number | undefined {
    const { focusedPath, data } = this.props;
    if (focusedPath && focusedPath.isSingleElement) {
      const firstElement = focusedPath.firstElement!;
      if (firstElement.isListIndex) {
        return firstElement.asListIndex;
      } else if (firstElement.canBeMapKey && this.definition.dataType === CollectionDataModelType.Map) {
        if (data instanceof MapDataModel) {
          return data.indexForKey(firstElement.asMapKey);
        }
      }
    }
    return undefined;
  }

  public columnSettings(collectValue: CollectValue, row?: number, column?: number) {
    if (row === undefined || column === undefined) {
      return {};
    }
    const child = this.children.get(row) as TableRowUIModel | undefined;
    if (child) {
      return child.columnSettings(collectValue, column);
    } else {
      return {};
    }
  }

  protected createChildModel(
    newProps: UIModelProps | undefined, definition: UIDefinitionBase, oldChild: UIModel | undefined): UIModel {
    if (newProps) {
      if (oldChild) {
        if (oldChild.definition !== definition || !oldChild.props.fastEquals(newProps)) {
          return new TableRowUIModel(this.definition, newProps, oldChild as TableRowUIModel);
        }
      } else {
        return new TableRowUIModel(this.definition, newProps);
      }
    } else {
      throw new Error();
    }
    return oldChild;
  }

  protected childDefinitionAt(index: number): TableUIDefinition {
    return this.definition;
  }

  protected childIndexes(): number[] {
    if (this._childIndexes) { return this._childIndexes; }
    const { collectionData } = this;
    return this._childIndexes = collectionData ? Array.from({length: collectionData.allDataSize}, (v, k) => k) : [];
  }

  private get collectionData(): CollectionDataModel | undefined {
    const { definition: { dataType }, props: { data } } = this;
    const dataTypeIsMatch =
      dataType === CollectionDataModelType.List && data instanceof ListDataModel ||
      dataType === CollectionDataModelType.Map && data instanceof MapDataModel;
    return dataTypeIsMatch ? data as CollectionDataModel : undefined;
  }

  protected childPropsAt(index: number): UIModelProps {
    const {dataPath, modelPath, focusedPath} = this.props;
    return new UIModelProps({
      stateNode: this.childStateAt(index),
      dataPath: dataPath.push(index),
      modelPath: modelPath.push(index),
      focusedPath: focusedPath && focusedPath.shift(),
      data: this.childDataAt(index),
      key: this.selectedKey(index)
    });
  }

  protected dataPathToChildIndex(element: DataPathElement): number | undefined {
    return element.canBeListIndex ? element.asListIndex : undefined;
  }

  private childStateAt(index: number): UIModelStateNode | undefined {
    const stateNode = this.props.stateNode;
    if (!stateNode) { return undefined; }
    return stateNode && stateNode.get(index);
  }

  private childDataAt(index: number): DataModelBase | undefined {
    const { data } = this.props;
    if (this.definition.dataType === CollectionDataModelType.Map && data instanceof MapDataModel) {
      return data.valueForListIndex(index);
    } else if (this.definition.dataType === CollectionDataModelType.List && data instanceof ListDataModel) {
      return data.getValueForIndex(index);
    }
    return undefined;
  }

  private selectedKey(selectedIndex: number): CollectionIndex | undefined {
    if (this.definition.dataType === CollectionDataModelType.List) { return selectedIndex; }
    if (this.props.data instanceof MapDataModel) {
      return this.props.data.keyForIndex(selectedIndex);
    } else {
      return undefined;
    }
  }
}