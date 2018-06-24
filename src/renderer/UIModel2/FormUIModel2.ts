import { MultiContentUIModel, UIModel2Props, UIModelStateNode } from './UIModel2';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import { CollectionIndex } from '../DataModel/DataModelBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import MapDataModel from '../DataModel/MapDataModel';
import { UIModelAction, UIModelUpdateDataAction } from './UIModel2Actions';
import DataPath from '../DataModel/Path/DataPath';
import DataPathElement from '../DataModel/Path/DataPathElement';

export default class FormUIModel2 extends MultiContentUIModel<FormUIDefinition> {
  private _childKeys?: string[];

  protected childDefinitionAt(index: CollectionIndex): UIDefinitionBase {
    return this.childDefinitionAtKey(index as string)!;
  }

  protected childIndexes(): CollectionIndex[] {
    if (this._childKeys) { return this._childKeys; }
    return this._childKeys = this.definition.contents.map(content => content!.key.asMapKey).toArray();
  }

  protected childPropsAt(index: CollectionIndex): UIModel2Props {
    const mapData = this.props.data instanceof MapDataModel ? this.props.data : undefined;
    const childData = mapData && mapData.valueForKey(index as string);
    const {dataPath, modelPath, focusedPath} = this.props;
    return new UIModel2Props({
      stateNode: this.childStateAt(index),
      dataPath: dataPath.push(index),
      modelPath: modelPath.push(index),
      focusedPath: focusedPath && focusedPath.shift(),
      data: childData
    });
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

  protected dataPathElementToChildIndex(element: DataPathElement): CollectionIndex | undefined {
    return element.canBeMapKey ? element.asMapKey : undefined;
  }

  private childDefinitionAtKey(key: string): UIDefinitionBase | undefined {
    return this.definition.contents.find(content => content!.key.asMapKey === key);
  }

  private childStateAt(index: CollectionIndex): UIModelStateNode | undefined {
    const stateNode = this.props.stateNode;
    if (!stateNode) { return undefined; }
    return stateNode && stateNode.get(index);
  }

  // private get state(): FormUIModelState | undefined {
  //   return this.props.stateNode && this.props.stateNode.get(stateKey) as FormUIModelState | undefined;
  // }
}
