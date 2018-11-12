import { MultiContentUIModel, UIModelProps, UIModelStateNode } from './UIModel';
import MapDataModel from '../DataModel/MapDataModel';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import DataPathElement from '../DataModel/Path/DataPathElement';
import DataModelBase from '../DataModel/DataModelBase';
import { CollectValue } from './types';
import { CellData, TableChangeForRow } from './TableRowUIModel';
import TableRowUIModel from './TableRowUIModel';
import UIModel from './UIModel';
import MappingTableUIDefinition from '../UIDefinition/MappingTableUIDefinition';
import { UIModelAction, UIModelFocusAction } from './UIModelActions';

type TableChange = [number, number, any, any];
type TableChangesByRow = Map<number, TableChangeForRow[]>;

export default class MappingTableUIModel extends MultiContentUIModel<MappingTableUIDefinition, string> {
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
    const sourceData = this.getSourceData(collectValue);
    if (!sourceData) {
      return [];
    }

    const data: CellData[][] = [];

    const emptyRowData = new Array(this.definition.contents.size);

    sourceData.forEachData((rowData, index) => {
      const row = this.childDataAt(index as string);
      data.push([
        index,
        ...emptyRowData
      ]);
    });
    return data;
  }

  public rowHeaders(collectValue: CollectValue): string[] {
    const sourceData = collectValue(this.definition.sourcePath, this.props.dataPath);
    if (sourceData.length === 0) { return []; }
    const sourceDatum = sourceData[0].data;
    if (!(sourceDatum instanceof MapDataModel)) { return []; }

    console.log(sourceDatum.keys);

    return sourceDatum.keys;
  }

  public columnHeaders(): string[] {
    return [
      '$key',
      ...this.definition.contents.map(content => content.label).toArray()
    ];
  }

  public get rowFocus(): number | undefined {
    const { focusedPath } = this.props;
    if (focusedPath && focusedPath.isSingleElement) {
      const firstElement = focusedPath.firstElement!;
      if (firstElement.isListIndex) {
        return firstElement.asListIndex;
      } else if (firstElement.canBeMapKey) {
        return this.childIndexes().indexOf(firstElement.asMapKey);
      }
    }
    return undefined;
  }

  public cellSettings(collectValue: CollectValue, row?: number, column?: number) {
    if (row === undefined || column === undefined) {
      return {};
    }

    if (column === 0) {
      return { readOnly: true };
    }

    const sourceData = this.getSourceData(collectValue);
    if (!sourceData) { return {}; }

    const sourceKeys = sourceData.keys;
    const key = sourceKeys[row];

    const child = this.children.get(key) as TableRowUIModel | undefined;
    if (child) {
      return child.columnSettings(collectValue, column - 1);
    } else {
      const newChildProps = new UIModelProps({
        stateNode: undefined,
        dataPath: this.props.dataPath.push(key),
        modelPath: this.props.modelPath.push(key),
        focusedPath: undefined,
        data: this.definition.defaultRowData,
        key: key
      });
      const row = new TableRowUIModel(this.definition, newChildProps);
      console.log(row.columnSettings(collectValue, column - 1));
      return row.columnSettings(collectValue, column - 1);
    }
  }

  protected createChildModel(
    newProps: UIModelProps | undefined, definition: UIDefinitionBase, oldChild: UIModel | undefined
  ): UIModel {
    if (!newProps) {
      throw new Error();
    }

    if (!oldChild) {
      return new TableRowUIModel(this.definition as any, newProps); // TODO anyをどうにかする
    }

    if (oldChild.definition !== definition || !oldChild.props.fastEquals(newProps)) {
      return new TableRowUIModel(this.definition as any, newProps, oldChild as TableRowUIModel); // TODO anyをどうにかする
    }

    return oldChild;
  }

  protected childDefinitionAt(index: string): UIDefinitionBase | undefined {
    return this.definition;
  }

  protected childIndexes(): string[] {
    const mapData = this.props.data instanceof MapDataModel ? this.props.data : undefined;
    if (!mapData) {
      return [];
    }

    return mapData.keys;
  }

  protected childPropsAt(index: string): UIModelProps | undefined {
    const {dataPath, modelPath, focusedPath} = this.props;
    return new UIModelProps({
      stateNode: this.childStateAt(index),
      dataPath: dataPath.push(index),
      modelPath: modelPath.push(index),
      focusedPath: focusedPath && focusedPath.shift(),
      data: this.childDataAt(index),
      key: index
    });
  }

  private childStateAt(index: string): UIModelStateNode | undefined {
    const stateNode = this.props.stateNode;
    if (!stateNode) { return undefined; }
    return stateNode && stateNode.get(index);
  }

  private childDataAt(index: string): DataModelBase | undefined {
    const { data } = this.props;
    if (data instanceof MapDataModel) {
      return data.valueForKey(index);
    }
    return undefined;
  }

  protected dataPathToChildIndex(element: DataPathElement): string | undefined {
    return element.canBeMapKey ? element.asMapKey : undefined;
  }

  private getSourceData(collectValue: CollectValue): MapDataModel | undefined {
    const collectedSource = collectValue(this.definition.sourcePath, this.props.dataPath);
    if (collectedSource.length === 0) {
      return undefined;
    }
    const sourceData = collectedSource[0].data;
    return sourceData instanceof MapDataModel ? sourceData : undefined;
  }

  public inputChanges(collectValue: CollectValue, changes: TableChange[]): UIModelAction[] {
    const sourceData = this.getSourceData(collectValue);
    if (!sourceData) {
      return [];
    }
    const sourceKeys = sourceData.keys;

    let actions: UIModelAction[] = [];
    const data = this.props.data instanceof MapDataModel ? this.props.data : undefined;
    if (!data) {
      actions.push(UIModelAction.Creators.setData(this.props.dataPath, this.definition.defaultData));
    }

    const changesByRow = MappingTableUIModel.coordinateChanges(changes);
    const createdForRow: Map<number, TableRowUIModel> = new Map();
    const {dataPath, modelPath } = this.props;

    changesByRow.forEach((value, keyIndex) => {
      const key = sourceKeys[keyIndex];
      const row = this.children.get(key) as TableRowUIModel | undefined;
      if (row) {
        actions = actions.concat(row.input(collectValue, value));
      } else {
        if (!createdForRow.has(keyIndex)) {
          actions.push(UIModelAction.Creators.appendData(this.props.dataPath, this.definition.defaultRowData));
          const newChildProps = new UIModelProps({
            stateNode: undefined,
            dataPath: dataPath.push(key),
            modelPath: modelPath.push(key),
            focusedPath: undefined,
            data: this.definition.defaultRowData,
            key: key
          });
          // createdForRow.set(keyIndex, new TableRowUIModel(this.childDefinitionAt(key), newChildProps));
        }
        actions = actions.concat(createdForRow.get(keyIndex)!.input(collectValue, value));
      }
    });
    if (actions.length > 0) {
      actions.push({ type: 'Focus', path: this.props.dataPath } as UIModelFocusAction);
    }

    return actions;
  }
}