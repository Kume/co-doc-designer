import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import DataPathElement from '../DataModel/Path/DataPathElement';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import MapDataModel from '../DataModel/MapDataModel';
import { StrictKeyedUIDefinition } from './UIDefinitionBase';
import { List } from 'immutable';

export interface TabUIDefinitionConfigObject extends UIDefinitionConfigObject {
  keyFlatten?: boolean;
}

export default class TabUIDefinition extends MultiContentsUIDefinition {
  public readonly keyFlatten: boolean;
  public readonly contents: List<StrictKeyedUIDefinition>;
  private _keyOrder?: string[];

  public constructor(config: TabUIDefinitionConfigObject) {
    super(config.label, config.key);
    this.keyFlatten = !!config.keyFlatten;
  }

  public get key(): DataPathElement | undefined {
    return this.keyFlatten ? this.contents.first()!.key : this._key;
  }

  public get keyOrder(): string[] {
    if (!this._keyOrder) {
      const keyOrder: string[] = [];
      this.contents.forEach(content => {
        if (content.key.canBeMapKey) {
          keyOrder.push(content.key.asMapKey);
        }
      });
      this._keyOrder = keyOrder;
    }
    return this._keyOrder;
  }

  public get defaultData(): MapDataModel {
    return MapDataModel.empty;
  }
}