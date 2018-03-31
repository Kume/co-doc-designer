import MultiContentsUIDefinition from './MultiContentsUIDefinition';
import UIDefinitionConfigObject from './UIDefinitionConfigObject';
import DataPathElement from '../DataModel/DataPathElement';

export interface FormUIDefinitionConfigObject extends UIDefinitionConfigObject {

}

export default class FormUIDefinition extends MultiContentsUIDefinition {
  public constructor(config: FormUIDefinitionConfigObject) {
    super(config.title, DataPathElement.parse(config.key));
  }
}
