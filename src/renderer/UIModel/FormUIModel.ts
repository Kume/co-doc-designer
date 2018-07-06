import { MultiContentUIModel, UIModelProps, UIModelStateNode } from './UIModel';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import DataModelBase from '../DataModel/DataModelBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import MapDataModel from '../DataModel/MapDataModel';
import { UIModelAction, UIModelUpdateDataAction } from './UIModelActions';
import DataPath from '../DataModel/Path/DataPath';
import DataPathElement from '../DataModel/Path/DataPathElement';
import DataModelFactory from '../DataModel/DataModelFactory';

type IndexType = string | symbol;
export default class FormUIModel extends MultiContentUIModel<FormUIDefinition, IndexType> {
  private _childKeys?: IndexType[];

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
    const {dataPath, modelPath, focusedPath} = this.props;
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

  public constructDefaultValue(dataPath: DataPath): UIModelUpdateDataAction[] {
    if (this.props.data instanceof MapDataModel) {
      return this.constructChildDefaultValue(dataPath);
    } else {
      return [
        UIModelAction.Creators.setData(this.props.dataPath, new MapDataModel({})),
        ...this.constructChildDefaultValue(dataPath)
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

  // private get state(): FormUIModelState | undefined {
  //   return this.props.stateNode && this.props.stateNode.get(stateKey) as FormUIModelState | undefined;
  // }
}
