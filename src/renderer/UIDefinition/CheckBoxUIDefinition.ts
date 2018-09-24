import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';

export interface CheckBoxUIDefinitionConfigObject extends UIDefinitionConfigObject {

}

export default class CheckBoxUIDefinition extends UIDefinitionBase {
  public constructor(config: CheckBoxUIDefinitionConfigObject) {
    super(config.label, config.key);
  }
}