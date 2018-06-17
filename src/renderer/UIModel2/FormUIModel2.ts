import { MultiContentUIModel, UIModel2Props } from './UIModel2';
import FormUIDefinition from '../UIDefinition/FormUIDefinition';
import { CollectionIndex } from '../DataModel/DataModelBase';
import UIDefinitionBase from '../UIDefinition/UIDefinitionBase';
import MapDataModel from '../DataModel/MapDataModel';

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
    return new UIModel2Props({
      state: undefined,
      editContext: undefined,
      path: this.props.path.push(index),
      data: childData
    });
  }

  private childDefinitionAtKey(key: string): UIDefinitionBase | undefined {
    return this.definition.contents.find(content => content!.key.asMapKey === key);
  }
}
