import UIModel, { MultiContentUIModel, UIModelProps, UIModelStateNode } from './UIModel';
import TableUIDefinition from '../UIDefinition/TableUIDefinition';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import DataPathElement from '../DataModel/Path/DataPathElement';
import DataPath from '../DataModel/Path/DataPath';
import MapDataModel from '../DataModel/MapDataModel';
import DataModelFactory from '../DataModel/DataModelFactory';
import DataModelBase from '../DataModel/DataModelBase';
import { CollectValue } from './types';
import TextUIModel from './TextUIModel';
import CheckBoxUIModel from './CheckBoxUIModel';
import SelectUIModel, { SelectUIModelValue } from './SelectUIModel';
import { UIModelAction } from './UIModelActions';
import { List } from 'immutable';
import { TemplateReference } from '../UIDefinition';
import NumberUIModel from './NumberUIModel';
import { TableUIModelCommon } from './TableUIModelCommon';
import SelectUIDefinition from '../UIDefinition/SelectUIDefinition';

export interface ReferenceCellSetting {
  editor: 'reference';
  renderer: 'reference';
  dataPath: DataPath;
  references: ReadonlyArray<TemplateReference>;
}

export interface MultiSelectCellSetting {
  editor: 'multi_select';
  renderer: 'multi_select';
  dataPath: DataPath;
  definition: SelectUIDefinition;
  value: SelectUIModelValue | undefined;
}

export type CellData = number | string | undefined | boolean | string[] | null;
export interface TableChangeForRow {
  column: number;
  value: any;
}

export interface ColumnSetting {
  type?: 'text' | 'autocomplete' | 'checkbox' | 'dropdown' | 'numeric';
  source?: ReadonlyArray<string>;
  strict?: boolean;
}

type IndexType = string | symbol;
export default class TableRowUIModel extends MultiContentUIModel<TableUIDefinition, IndexType> {
  private _childKeys?: IndexType[];
  private _childrenByListIndex?: UIModel[];
  private _dataPath?: DataPath;

  public rawData(collectValue: CollectValue): CellData[] {
    const cells: CellData[] = [];
    this.children.forEach((child, key) => {
      if (child instanceof TextUIModel) {
        cells.push(child.text);
      } else if (child instanceof CheckBoxUIModel) {
        cells.push(child.isChecked);
      } else if (child instanceof SelectUIModel) {
        if (child.definition.isMulti) {
          cells.push(JSON.stringify(child.value));
        } else {
          cells.push(child.labelForValue(collectValue, child.value));
        }
      } else if (child instanceof NumberUIModel) {
        cells.push(child.number);
      } else {
        cells.push(null);
      }
      return '';
    });
    return cells;
  }

  public input(collectValue: CollectValue, changes: TableChangeForRow[]): UIModelAction[] {
    let actions: UIModelAction[] = [];
    const { mapData } = this;
    if (!mapData) {
      actions.push(UIModelAction.Creators.setData(this.dataPath, MapDataModel.empty));
    }
    for (const change of changes) {
      const child = this.childAtIndex(change.column);
      if (child) {
        if (child instanceof TextUIModel) {
          if (typeof change.value === 'string') {
            actions = actions.concat(child.input(change.value));
          }
        } else if (child instanceof CheckBoxUIModel) {
          if (CheckBoxUIModel.canInputValue(change.value)) {
            actions = actions.concat(child.input(change.value));
          }
        } else if (child instanceof NumberUIModel) {
          if (NumberUIModel.canInputValue(change.value)) {
            actions = actions.concat(child.input(change.value));
          }
        } else if (child instanceof SelectUIModel) {
          if (child.definition.isMulti) {
            try {
              const value = JSON.parse(change.value);
              actions = actions.concat(child.input(value));
            } catch (error) {
              // JSONエラーになる入力は受け付けない
            }
          } else {
            actions = actions.concat(child.inputLabel(change.value.toString(), collectValue));
          }
        }
      }
    }
    return actions;
  }

  public columnSettings(
    collectValue: CollectValue, column: number
  ): ColumnSetting | ReferenceCellSetting | MultiSelectCellSetting {
    const childModel = this.childAtIndex(column)!;
    return TableUIModelCommon.cellSetting(childModel, childModel.definition, this.dataPath, collectValue, column);
  }

  protected childDefinitionAt(index: IndexType): UIDefinitionBase | undefined {
    return this.definition.contents.find(content => {
      const key = content.key!;
      if (index === DataPathElement.keySymbol) {
        return key.isKey;
      } else {
        return key.canBeMapKey && key.asMapKey === index;
      }
    });
  }

  protected childIndexes(): IndexType[] {
    if (this._childKeys) { return this._childKeys; }
    return this._childKeys = this.definition.contents
      .map(content => this.dataPathToChildIndex(content.key!)!).toArray();
  }

  protected childPropsAt(index: IndexType): UIModelProps {
    const { dataPath, props: { modelPath, focusedPath } } = this;
    return new UIModelProps({
      stateNode: this.childStateAt(index),
      dataPath: dataPath.push(index),
      modelPath: modelPath.push(index),
      focusedPath: focusedPath && focusedPath.shift(),
      data: this.childDataAt(index)
    });
  }

  protected dataPathToChildIndex(element: DataPathElement): IndexType | undefined {
    if (element.isKey) {
      return DataPathElement.keySymbol;
    } else if (element.canBeMapKey) {
      return element.asMapKey;
    }
    return undefined;
  }

  private childStateAt(index: IndexType): UIModelStateNode | undefined {
    const stateNode = this.props.stateNode;
    if (!stateNode) { return undefined; }
    return stateNode && stateNode.get(index);
  }

  private childDataAt(index: IndexType): DataModelBase | undefined {
    if (index === DataPathElement.keySymbol) {
      const dataPath = this.dataPath;
      return dataPath.isEmptyPath ? undefined : DataModelFactory.create(this.props.key);
    } else if (typeof index === 'symbol') {
      throw new Error();
    }
    const mapData = this.props.data instanceof MapDataModel ? this.props.data : undefined;
    return mapData && mapData.getValue(new DataPath(index));
  }

  private get mapData(): MapDataModel | undefined {
    const { data } = this.props;
    return data instanceof MapDataModel ? data : undefined;
  }

  private childAtIndex(index: number): UIModel | undefined {
    return this.childrenByListIndex[index];
  }

  private get childrenByListIndex(): UIModel[] {
    if (!this._childrenByListIndex) {
      this._childrenByListIndex = [];
      this.children.forEach(child => {
        this._childrenByListIndex!.push(child!);
      });
    }
    return this._childrenByListIndex;
  }

  private get dataPath(): DataPath {
    if (!this._dataPath) {
      const { dataPath } = this.props;
      if (dataPath.isNotEmptyPath()) {
        const { lastElement } = dataPath;
        this._dataPath = dataPath.pop().push(this.makeDataPathElementWithMetadata(lastElement));
      } else {
        this._dataPath = dataPath;
      }
    }
    return this._dataPath;
  }

  private makeDataPathElementWithMetadata(sourceElement: DataPathElement): DataPathElement {
    let keyOrder: List<string> = sourceElement.metadata.get('keyOrder') || List();
    const newKeyOrder = keyOrder.concat(this.definition.keyOrder) as List<string>;
    return sourceElement.setMetadata(sourceElement.metadata.set('keyOrder', newKeyOrder));
  }
}