import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import UIDefinitionBase from './UIDefinitionBase';
import DataPathElement from '../DataModel/Path/DataPathElement';

export interface NumberUIDefinitionConfigObject extends UIDefinitionConfigObject {

}

export default class NumberUIDefinition extends UIDefinitionBase {
  public constructor(config: NumberUIDefinitionConfigObject) {
    super(config.label, DataPathElement.parse(config.key));
  }
}
