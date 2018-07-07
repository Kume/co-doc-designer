import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import DataPathElement from '../DataModel/Path/DataPathElement';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';

export interface TabUIDefinitionConfigObject extends UIDefinitionConfigObject {
  keyFlatten?: boolean;
}

export default class TabUIDefinition extends MultiContentsUIDefinition {
  public readonly keyFlatten: boolean;

  public constructor(config: TabUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
    this.keyFlatten = !!config.keyFlatten;
  }

  public get key(): DataPathElement {
    return this.keyFlatten ? this.contents.first().key : this._key;
  }
}