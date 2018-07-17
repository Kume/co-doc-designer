import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import DataPathElement from '../DataModel/Path/DataPathElement';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import MapDataModel from '../DataModel/MapDataModel';

export interface TabUIDefinitionConfigObject extends UIDefinitionConfigObject {
  keyFlatten?: boolean;
}

export default class TabUIDefinition extends MultiContentsUIDefinition {
  public readonly keyFlatten: boolean;
  private _keyOrder?: string[];

  public constructor(config: TabUIDefinitionConfigObject) {
    super(config.label, DataPathElement.parse(config.key));
    this.keyFlatten = !!config.keyFlatten;
  }

  public get key(): DataPathElement {
    return this.keyFlatten ? this.contents.first().key : this._key;
  }

  public get keyOrder(): string[] {
    if (!this._keyOrder) {
      this._keyOrder = [];
      this.contents.forEach(content => {
        if (content!.key.canBeMapKey) {
          this._keyOrder!.push(content!.key.asMapKey);
        }
      });
    }
    return this._keyOrder;
  }

  public get defaultData(): MapDataModel {
    return MapDataModel.empty;
  }
}