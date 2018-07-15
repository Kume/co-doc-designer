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
import SelectUIModel from './SelectUIModel';
import { UIModelAction } from './UIModelActions';
import { List } from 'immutable';
import { TemplateReference } from '../UIDefinition/TextUIDefinition';

export interface ReferenceCellSetting {
  editor: 'reference';
  renderer: 'reference';
  dataPath: DataPath;
  references: ReadonlyArray<TemplateReference>;
}

export type CellData = number | string | undefined | boolean;
export interface TableChangeForRow {
  column: number;
  value: any;
}

export interface ColumnSetting {
  type?: 'text' | 'autocomplete' | 'checkbox' | 'dropdown';
  source?: string[];
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
        cells.push(child.labelForValue(collectValue, child.value));
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
        } else if (child instanceof SelectUIModel) {
          actions = actions.concat(child.inputLabel(change.value.toString(), collectValue));
        }
      }
    }
    return actions;
  }

  public columnSettings(collectValue: CollectValue, column: number): ColumnSetting | ReferenceCellSetting {
    const child = this.childAtIndex(column);
    if (child) {
      if (child instanceof TextUIModel) {
        if (child.definition.options) {
          return {
            type: 'autocomplete',
            source: child.definition.options,
            strict: false
          };
        } else if (child.definition.references) {
          return {
            editor: 'reference',
            renderer: 'reference',
            dataPath: this.dataPath.push(column),
            references: child.definition.references
          };
        } else {
          return {
            type: 'text'
          };
        }
      } else if (child instanceof CheckBoxUIModel) {
        return {
          type: 'checkbox'
        };
      } else if (child instanceof SelectUIModel) {
        return {
          type: 'dropdown',
          source: child.options(collectValue).map(option => option.label)
        };
      }
    }
    return {};
  }

  protected childDefinitionAt(index: IndexType): UIDefinitionBase {
    return this.definition.contents.find(content => {
      const key = content!.key;
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
      .map(content => this.dataPathToChildIndex(content!.key)!).toArray();
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
      if (dataPath.isEmptyPath) {
        this._dataPath = dataPath;
      } else {
        const { lastElement } = dataPath;
        this._dataPath = dataPath.pop().push(this.makeDataPathElementWithMetadata(lastElement));
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