import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPathElement from '../DataModel/Path/DataPathElement';

export interface FormUIDefinitionConfigObject extends UIDefinitionConfigObject {
  keyFlatten?: boolean;
}

export default class FormUIDefinition extends MultiContentsUIDefinition {
  public readonly keyFlatten: boolean;
  private _keyOrder?: string[];

  public constructor(config: FormUIDefinitionConfigObject) {
    super(config.label, config.key);
    this.keyFlatten = !!config.keyFlatten;
  }

  public get key(): DataPathElement | undefined {
    return this.keyFlatten ? this.contents.first()!.key : this._key;
  }

  public get keyOrder(): string[] {
    if (!this._keyOrder) {
      this._keyOrder = [];
      this.contents.forEach(content => {
        if (content.key!.canBeMapKey) {
          this._keyOrder!.push(content.key!.asMapKey);
        }
      });
    }
    return this._keyOrder;
  }
}
