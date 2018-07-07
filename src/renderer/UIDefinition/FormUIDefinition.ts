import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPathElement from '../DataModel/Path/DataPathElement';

export interface FormUIDefinitionConfigObject extends UIDefinitionConfigObject {
  keyFlatten?: boolean;
}

export default class FormUIDefinition extends MultiContentsUIDefinition {
  public readonly keyFlatten: boolean;

  public constructor(config: FormUIDefinitionConfigObject) {
    super(config.label, DataPathElement.parse(config.key));
    this.keyFlatten = !!config.keyFlatten;
  }

  public get key(): DataPathElement {
    return this.keyFlatten ? this.contents.first().key : this._key;
  }
}
