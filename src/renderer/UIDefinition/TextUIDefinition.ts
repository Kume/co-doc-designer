import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPathElement from '../DataModel/DataPathElement';

export interface TextUIDefinitionConfigObject extends UIDefinitionConfigObject {
  emptyToNull: boolean;
}

export default class TextUIDefinition extends UIDefinitionBase {
  public constructor(config: TextUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
  }
}
