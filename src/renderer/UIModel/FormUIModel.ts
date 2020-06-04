import { MultiContentUIModel, UIModelProps, UIModelStateNode } from './UIModel';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import DataModelBase from '../DataModel/DataModelBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import MapDataModel from '../DataModel/MapDataModel';
import { UIModelAction, UIModelUpdateDataAction } from './UIModelActions';
import DataPath from '../DataModel/Path/DataPath';
import DataPathElement from '../DataModel/Path/DataPathElement';
import DataModelFactory from '../DataModel/DataModelFactory';
import { List } from 'immutable';

type IndexType = string | symbol;
export default class FormUIModel extends MultiContentUIModel<FormUIDefinition, IndexType> {
  private _childKeys?: IndexType[];
  private _dataPath?: DataPath;

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

  protected childPropsAt(index: IndexType): UIModelProps | undefined {
    const { dataPath, props: { modelPath, focusedPath, data } } = this;
    const childDefinition = this.childDefinitionAt(index);
    if (!childDefinition) { return undefined; }
    if (childDefinition.keyFlatten) {
      return new UIModelProps({
        stateNode: this.childStateAt(index),
        dataPath,
        modelPath: modelPath.push(index),
        focusedPath,
        data,
        key: this.props.key,
      });
    } else {
      let childFocusedPath: DataPath | undefined;
      if (focusedPath && focusedPath.isNotEmptyPath() && DataPathElement.isMatch(index, focusedPath.firstElement)) {
        childFocusedPath = focusedPath.shift();
      }
      return new UIModelProps({
        stateNode: this.childStateAt(index),
        dataPath: dataPath.push(index),
        modelPath: modelPath.push(index),
        focusedPath: childFocusedPath,
        data: this.childDataAt(index)
      });
    }
  }

  protected dataPathToChildIndex(element: DataPathElement): IndexType | undefined {
    if (element.isKey) {
      return DataPathElement.keySymbol;
    } else if (element.canBeMapKey) {
      return element.asMapKey;
    }
    return undefined;
  }

  public constructDefaultValue(data: DataModelBase | undefined, dataPath: DataPath): UIModelUpdateDataAction[] {
    if (data instanceof MapDataModel) {
      return this.constructChildDefaultValue(data, dataPath);
    } else {
      return [
        UIModelAction.Creators.setData(this.dataPath, new MapDataModel({})),
        ...this.constructChildDefaultValue(data, dataPath)
      ];
    }
  }

  private childStateAt(index: IndexType): UIModelStateNode | undefined {
    const stateNode = this.props.stateNode;
    if (!stateNode) { return undefined; }
    return stateNode && stateNode.get(index);
  }

  private childDataAt(index: IndexType): DataModelBase | undefined {
    if (index === DataPathElement.keySymbol) {
      const dataPath = this.props.dataPath;
      return dataPath.isEmptyPath ? undefined : DataModelFactory.create(this.props.key);
    } else if (typeof index === 'symbol') {
      throw new Error();
    }
    const mapData = this.props.data instanceof MapDataModel ? this.props.data : undefined;
    return mapData && mapData.getValue(new DataPath(index));
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

  // private get state(): FormUIModelState | undefined {
  //   return this.props.stateNode && this.props.stateNode.get(stateKey) as FormUIModelState | undefined;
  // }
}
