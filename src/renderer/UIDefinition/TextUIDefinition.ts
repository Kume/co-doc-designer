import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPathElement from '../DataModel/Path/DataPathElement';

export interface TextUIDefinitionConfigObject extends UIDefinitionConfigObject {
  emptyToNull: boolean;
  options?: Array<string>;
}

export default class TextUIDefinition extends UIDefinitionBase {
  public options?: Array<string>;

  public constructor(config: TextUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
    this.options = config.options;
  }
}
