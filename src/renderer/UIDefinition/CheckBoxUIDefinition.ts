import UIDefinitionBase from './UIDefinitionBase';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPathElement from '../DataModel/Path/DataPathElement';

export interface CheckBoxUIDefinitionConfigObject extends UIDefinitionConfigObject {

}

export default class CheckBoxUIDefinition extends UIDefinitionBase {
  public constructor(config: CheckBoxUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
  }
}