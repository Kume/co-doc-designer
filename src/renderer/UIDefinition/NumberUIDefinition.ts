import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import UIDefinitionBase from './UIDefinitionBase';

export interface NumberUIDefinitionConfigObject extends UIDefinitionConfigObject {

}

export default class NumberUIDefinition extends UIDefinitionBase {
  public constructor(config: NumberUIDefinitionConfigObject) {
    super(config.label, config.key);
  }
}
